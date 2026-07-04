import os
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from typing import Dict, Any, List

from database import db, serialize_doc, serialize_list
from models import (
    WorkerModel, BudgetModel, EmailModel, TodoModel,
    NotificationModel, MeetingModel, ScheduleModel, InventoryModel,
    ChatMessage, ChatRequest, WidgetState
)
from gemini_service import generate_response

app = FastAPI(title="AI-Powered Construction Management Workspace API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Workspace Collections mapping
COLLECTIONS = {
    "workers": "workers",
    "budgets": "budgets",
    "emails": "emails",
    "todos": "todos",
    "notifications": "notifications",
    "meetings": "meetings",
    "schedules": "schedules",
    "inventory": "inventory",
}

# --- Workspace Entire Dashboard route ---

@app.get("/api/workspace")
async def get_entire_workspace():
    """Fetches all workspace items in a single call to bootstrap the UI state."""
    data = {}
    for key, coll_name in COLLECTIONS.items():
        docs = await db[coll_name].find().to_list(1000)
        data[key] = serialize_list(docs)
    return data

# --- Chat History & Interaction routes (Specific first) ---

@app.get("/api/chat/history")
async def get_chat_history():
    """Retrieves list of previous chat messages."""
    docs = await db["chat_history"].find().sort("_id", 1).to_list(1000)
    return serialize_list(docs)

@app.post("/api/chat")
async def send_chat_message(payload: ChatRequest):
    user_text = payload.message
    
    # 1. Save user message to database
    user_msg_doc = {"role": "user", "text": user_text, "widget": None}
    await db["chat_history"].insert_one(user_msg_doc)
    
    # 2. Call Gemini service to analyze and generate text or widget response
    gemini_resp = await generate_response(user_text)
    
    # Form the AI response document
    ai_widget = None
    if gemini_resp.get("responseType") == "widget":
        ai_widget = {
            "type": gemini_resp.get("widget"),
            "props": gemini_resp.get("props", {}),
            "status": "active",
            "dataId": None
        }
        
    ai_msg_doc = {
        "role": "model",
        "text": gemini_resp.get("message", ""),
        "widget": ai_widget
    }
    
    # 3. Save AI message to database
    result = await db["chat_history"].insert_one(ai_msg_doc)
    created_ai_msg = await db["chat_history"].find_one({"_id": result.inserted_id})
    
    return serialize_doc(created_ai_msg)

@app.put("/api/chat/message/{message_id}")
async def update_chat_message(message_id: str, payload: dict = Body(...)):
    """Allows updating a chat message's widget state (e.g. status='saved', dataId='...', props={...})"""
    update_data = {k: v for k, v in payload.items() if k != "id" and k != "_id"}
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
    """Deletes a message from the conversation (like archiving or manual delete)."""
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
    
    # Insert new record
    result = await db[COLLECTIONS[category]].insert_one(payload)
    created = await db[COLLECTIONS[category]].find_one({"_id": result.inserted_id})
    return serialize_doc(created)

@app.put("/api/{category}/{item_id}")
async def update_item(category: str, item_id: str, payload: dict = Body(...)):
    if category not in COLLECTIONS:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Clean up payload keys like 'id' before database insertion
    update_data = {k: v for k, v in payload.items() if k != "id" and k != "_id"}
    
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
    # We find any chat log referencing this item ID in its widget.dataId and delete that chat message
    await db["chat_history"].delete_many({"widget.dataId": item_id})
    
    return {"success": True, "deleted_id": item_id}
