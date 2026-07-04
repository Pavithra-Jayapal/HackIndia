import os
import time
from dotenv import load_dotenv
load_dotenv(override=True)

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from bson import ObjectId
from typing import Dict, Any, List

from database import db, serialize_doc, serialize_list
from models import ChatRequest
from gemini_service import generate_response
from google_service_helper import (
    SCOPES,
    get_google_credentials_doc,
    save_google_credentials_doc,
    send_gmail_email,
    create_calendar_event
)

try:
    from google_auth_oauthlib.flow import Flow
    OAUTH_AVAILABLE = True
except ImportError:
    OAUTH_AVAILABLE = False

app = FastAPI(title="AI-Powered Construction Management Workspace API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Workspace Collections mapping
COLLECTIONS = {
    "workers": "workers",
    "budgets": "budgets",
    "inventory": "inventory",
    "todos": "todos",
    "schedules": "schedules",
    "meetings": "meetings",
    "emails": "emails",
    "notifications": "notifications",
}

# Helper to check if a string is a valid MongoDB ObjectId
def is_valid_object_id(val: str) -> bool:
    try:
        ObjectId(val)
        return True
    except Exception:
        return False

# --- Google OAuth2 Routes (Must be declared before dynamic dynamic endpoints) ---

@app.get("/api/auth/status")
async def get_auth_status():
    """Checks if Google Account refresh tokens are stored in database."""
    try:
        # Check if credential params are set in environment
        client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        if not client_id or not client_secret or client_id == "YOUR_GOOGLE_CLIENT_ID":
            return {"connected": False, "configured": False}
            
        doc = await get_google_credentials_doc()
        if doc and "token_data" in doc:
            return {"connected": True, "configured": True}
        return {"connected": False, "configured": True}
    except Exception as e:
        return {"connected": False, "configured": False, "error": str(e)}

@app.get("/api/auth/url")
async def get_auth_url():
    """Generates Google OAuth callback url for prompt authentication."""
    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "")

    if not client_id or not client_secret or client_id == "YOUR_GOOGLE_CLIENT_ID":
        raise HTTPException(
            status_code=400,
            detail="Google OAuth Credentials are not configured in backend/.env."
        )

    client_config = {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }

    try:
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=redirect_uri
        )
        auth_url, _ = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent"
        )
        return {"url": auth_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth Flow initialization failed: {str(e)}")

@app.get("/api/auth/callback")
async def auth_callback(code: str = None, error: str = None):
    """Exchanges Google authorization code for refresh tokens and updates database."""
    if error:
        return RedirectResponse(url="http://localhost:5173/?auth=error&detail=" + error)
    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code parameter")

    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "")

    client_config = {
        "web": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }

    try:
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=redirect_uri
        )
        flow.fetch_token(code=code)
        credentials = flow.credentials

        token_data = {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": credentials.token_uri,
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes,
            "expiry": credentials.expiry.timestamp() if hasattr(credentials.expiry, 'timestamp') else (time.time() + 3500)
        }

        await save_google_credentials_doc(token_data)
        return RedirectResponse(url="http://localhost:5173/?auth=success")
    except Exception as e:
        return RedirectResponse(url=f"http://localhost:5173/?auth=error&detail={str(e)}")

# --- Real Integration API triggers (Declared before Dynamic Category Endpoint) ---

@app.post("/api/emails")
async def create_email_item(payload: dict = Body(...)):
    """Sends a real email via Gmail API and logs the entry to MongoDB."""
    to = payload.get("to")
    subject = payload.get("subject", "Project Notification")
    body = payload.get("body", "")

    if not to:
        raise HTTPException(status_code=400, detail="Missing 'to' recipient email address.")

    try:
        # Trigger Google Gmail send
        gmail_res = await send_gmail_email(to, subject, body)
        payload["gmailMessageId"] = gmail_res.get("messageId")
        payload["status"] = "Sent"
    except Exception as e:
        err_str = str(e)
        if "authenticate" in err_str or "not connected" in err_str:
            raise HTTPException(status_code=401, detail=err_str)
        raise HTTPException(status_code=400, detail=f"Gmail Sending Failed: {err_str}")

    payload["createdAt"] = time.time()
    payload["updatedAt"] = time.time()
    payload["version"] = 1

    result = await db["emails"].insert_one(payload)
    created = await db["emails"].find_one({"_id": result.inserted_id})
    return serialize_doc(created)

@app.post("/api/meetings")
async def create_meeting_item(payload: dict = Body(...)):
    """Schedules a calendar event with a Meet video conference link and invites attendees."""
    title = payload.get("title", "Project Meeting")
    date_str = payload.get("date")
    time_str = payload.get("time")
    attendees_val = payload.get("attendees", "")
    agenda = payload.get("agenda", "")

    if not date_str or not time_str:
        raise HTTPException(status_code=400, detail="Missing 'date' or 'time' parameter.")

    # Format attendees comma list to array
    if isinstance(attendees_val, str):
        attendees_list = [email.strip() for email in attendees_val.split(",") if email.strip()]
    elif isinstance(attendees_val, list):
        attendees_list = [str(email).strip() for email in attendees_val if str(email).strip()]
    else:
        attendees_list = []

    try:
        # Trigger Google Calendar + Meet conference creation
        calendar_res = await create_calendar_event(title, date_str, time_str, attendees_list, agenda)
        
        # Save generated Google Meet and HTML links directly into the database schema
        payload["googleEventId"] = calendar_res.get("eventId")
        payload["meetUrl"] = calendar_res.get("meetUrl")
        payload["calendarUrl"] = calendar_res.get("calendarUrl")
        payload["attendees"] = attendees_list
    except Exception as e:
        err_str = str(e)
        if "authenticate" in err_str or "not connected" in err_str:
            raise HTTPException(status_code=401, detail=err_str)
        raise HTTPException(status_code=400, detail=f"Calendar Sync Failed: {err_str}")

    payload["createdAt"] = time.time()
    payload["updatedAt"] = time.time()
    payload["version"] = 1

    result = await db["meetings"].insert_one(payload)
    created = await db["meetings"].find_one({"_id": result.inserted_id})
    return serialize_doc(created)

# --- Workspace Entire Dashboard route ---

@app.get("/api/workspace")
async def get_entire_workspace():
    """Fetches all workspace items in a single call to bootstrap the UI state."""
    data = {}
    for key, coll_name in COLLECTIONS.items():
        docs = await db[coll_name].find().to_list(1000)
        data[key] = serialize_list(docs)
    return data

# --- Chat History & Interaction routes ---

@app.get("/api/chat/history")
async def get_chat_history():
    """Retrieves list of previous chat messages."""
    docs = await db["chat_history"].find().sort("_id", 1).to_list(1000)
    return serialize_list(docs)

@app.post("/api/chat")
async def send_chat_message(payload: ChatRequest):
    user_text = payload.message
    
    # 1. Save user message to database
    user_msg_doc = {
        "role": "user", 
        "text": user_text, 
        "widget": None,
        "createdAt": time.time(),
        "updatedAt": time.time(),
        "version": 1
    }
    await db["chat_history"].insert_one(user_msg_doc)
    
    # 2. Gather full MongoDB collections context to inject into Gemini
    context = {}
    for key, coll_name in COLLECTIONS.items():
        docs = await db[coll_name].find().to_list(1000)
        context[key] = serialize_list(docs)
        
    chat_docs = await db["chat_history"].find().sort("_id", 1).to_list(100)
    context["chat_history"] = serialize_list(chat_docs)
    
    # 3. Call Gemini service to analyze and generate planning response
    gemini_resp = await generate_response(user_text, context)
    
    response_type = gemini_resp.get("responseType", "text")
    widget_schema = gemini_resp.get("widget")
    message_text = gemini_resp.get("message", "")

    # Form the AI response document
    ai_widget = None
    if response_type == "widget" and widget_schema:
        ai_widget = {
            "type": "form",
            "title": widget_schema.get("title", "Form Request"),
            "fields": widget_schema.get("fields", []),
            "buttons": widget_schema.get("buttons", []),
            "status": "active",
            "dataId": None,
            "submittedData": None
        }
        
    ai_msg_doc = {
        "role": "model",
        "text": message_text,
        "widget": ai_widget,
        "createdAt": time.time(),
        "updatedAt": time.time(),
        "version": 1
    }
    
    # 4. Save AI message to database
    result = await db["chat_history"].insert_one(ai_msg_doc)
    created_ai_msg = serialize_doc(ai_msg_doc)
    created_ai_msg["id"] = str(result.inserted_id)
    
    return created_ai_msg

@app.put("/api/chat/message/{message_id}")
async def update_chat_message(message_id: str, payload: dict = Body(...)):
    """Allows updating a chat message's widget state."""
    update_data = {k: v for k, v in payload.items() if k != "id" and k != "_id"}
    update_data["updatedAt"] = time.time()
    result = await db["chat_history"].update_one(
        {"_id": ObjectId(message_id)},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chat message not found")
        
    updated = await db["chat_history"].find_one({"_id": ObjectId(message_id)})
    return serialize_doc(updated)

@app.delete("/api/chat/message/{message_id}")
async def delete_chat_message(message_id: str):
    """Deletes a message from the conversation."""
    result = await db["chat_history"].delete_one({"_id": ObjectId(message_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chat message not found")
    return {"success": True}

@app.delete("/api/chat/clear")
async def clear_chat():
    """Resets the chat history in the DB."""
    await db["chat_history"].delete_many({})
    return {"success": True}

# --- Generic CRUD routes for Workspace collections (Catch-all last) ---

@app.get("/api/{category}")
async def get_items(category: str):
    if category not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Category not found")
    docs = await db[COLLECTIONS[category]].find().to_list(1000)
    return serialize_list(docs)

@app.post("/api/{category}")
async def create_item(category: str, payload: dict = Body(...)):
    if category not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Category not found")
    
    payload["createdAt"] = time.time()
    payload["updatedAt"] = time.time()
    payload["version"] = 1
    
    # Insert new record
    result = await db[COLLECTIONS[category]].insert_one(payload)
    created = await db[COLLECTIONS[category]].find_one({"_id": result.inserted_id})
    return serialize_doc(created)

@app.put("/api/{category}/{item_id}")
async def update_item(category: str, item_id: str, payload: dict = Body(...)):
    if category not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = {k: v for k, v in payload.items() if k != "id" and k != "_id"}
    update_data["updatedAt"] = time.time()
    if "version" in update_data:
        try:
            update_data["version"] = int(update_data["version"]) + 1
        except Exception:
            update_data["version"] = 1
            
    result = await db[COLLECTIONS[category]].update_one(
        {"_id": ObjectId(item_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
        
    updated = await db[COLLECTIONS[category]].find_one({"_id": ObjectId(item_id)})
    return serialize_doc(updated)

@app.delete("/api/{category}/{item_id}")
async def delete_item(category: str, item_id: str):
    if category not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Category not found")
        
    result = await db[COLLECTIONS[category]].delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    
    # CASCADE DELETE: Remove or invalidate active widgets/summaries linked to this data record in the chat history
    await db["chat_history"].delete_many({"widget.dataId": item_id})
    
    return {"success": True, "deleted_id": item_id}
