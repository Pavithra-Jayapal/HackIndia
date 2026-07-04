import os
import base64
import time
import json
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from typing import List, Dict, Any

from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request

from database import db

# Required Scopes for sending Gmail and managing Calendar events
SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar.events",
]

# Fetch credentials model from MongoDB collection `google_tokens`
async def get_google_credentials_doc() -> Dict[str, Any]:
    doc = await db["google_tokens"].find_one({"type": "oauth_token"})
    return doc

async def save_google_credentials_doc(token_data: Dict[str, Any]):
    await db["google_tokens"].update_one(
        {"type": "oauth_token"},
        {"$set": {
            "type": "oauth_token",
            "token_data": token_data,
            "updatedAt": time.time()
        }},
        upsert=True
    )

# Retrieve active Google Credentials, refreshing automatically if expired
async def get_google_credentials() -> Credentials:
    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
    
    if not client_id or not client_secret or client_id == "YOUR_GOOGLE_CLIENT_ID":
        raise Exception("Google Client configuration is missing in backend/.env.")

    doc = await get_google_credentials_doc()
    if not doc or "token_data" not in doc:
        raise Exception("Google Account is not connected. Please authenticate first.")

    token_data = doc["token_data"]
    
    # Construct Credentials object
    creds = Credentials(
        token=token_data.get("access_token"),
        refresh_token=token_data.get("refresh_token"),
        token_uri=token_data.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=client_id,
        client_secret=client_secret,
        scopes=token_data.get("scopes", SCOPES)
    )

    # Automatically refresh if expired
    if creds.expired or (token_data.get("expiry") and time.time() > token_data.get("expiry")):
        try:
            print("Google Access Token has expired. Refreshing token...")
            creds.refresh(Request())
            # Save the new access token and updated details
            new_token_data = {
                "access_token": creds.token,
                "refresh_token": creds.refresh_token,
                "token_uri": creds.token_uri,
                "client_id": creds.client_id,
                "client_secret": creds.client_secret,
                "scopes": creds.scopes,
                "expiry": creds.expiry.timestamp() if hasattr(creds.expiry, 'timestamp') else (time.time() + 3500)
            }
            await save_google_credentials_doc(new_token_data)
        except Exception as e:
            raise Exception(f"Failed to refresh Google access token: {str(e)}")

    return creds

# --- Gmail Sending Action ---

async def send_gmail_email(to: str, subject: str, body: str) -> Dict[str, Any]:
    """Sends a real email using Google's Gmail API."""
    if not to or "@" not in to:
        raise ValueError(f"Invalid email address: '{to}'")

    creds = await get_google_credentials()
    service = build("gmail", "v1", credentials=creds)

    message = MIMEText(body)
    message["to"] = to
    message["subject"] = subject

    # Base64url encode the message raw payload
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    
    try:
        sent_message = service.users().messages().send(
            userId="me",
            body={"raw": raw}
        ).execute()
        
        return {
            "success": True,
            "messageId": sent_message.get("id"),
            "recipient": to,
            "status": "sent"
        }
    except Exception as e:
        raise Exception(f"Gmail Send API failed: {str(e)}")

# --- Google Calendar + Google Meet Action ---

async def create_calendar_event(
    title: str,
    date_str: str,
    time_str: str,
    attendees: List[str],
    agenda: str
) -> Dict[str, Any]:
    """Creates a Calendar Event with Google Meet conference coordinates."""
    creds = await get_google_credentials()
    service = build("calendar", "v3", credentials=creds)

    # Parse date and time to ISO strings
    dt_str = f"{date_str} {time_str}"
    try:
        start_dt = datetime.strptime(dt_str, "%Y-%m-%d %I:%M %p")
    except Exception:
        try:
            start_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        except Exception:
            # Fallback to tomorrow if parsing fails completely
            start_dt = datetime.now() + timedelta(days=1)
            
    end_dt = start_dt + timedelta(hours=1)

    start_iso = start_dt.isoformat()
    end_iso = end_dt.isoformat()
    # Assume local system timezone (e.g. Asia/Kolkata)
    local_tz = "Asia/Kolkata"

    attendee_objs = [{"email": email.strip()} for email in attendees if email.strip() and "@" in email]

    event_payload = {
        "summary": title,
        "description": agenda,
        "start": {
            "dateTime": start_iso,
            "timeZone": local_tz,
        },
        "end": {
            "dateTime": end_iso,
            "timeZone": local_tz,
        },
        "attendees": attendee_objs,
        "conferenceData": {
            "createRequest": {
                "requestId": f"meet_{int(time.time())}",
                "conferenceSolutionKey": {"type": "hangoutsMeet"}
            }
        }
    }

    try:
        event = service.events().insert(
            calendarId="primary",
            body=event_payload,
            conferenceDataVersion=1,
            sendUpdates="all"
        ).execute()

        # Extract Event ID, Meet conferencing link, and Calendar URL
        event_id = event.get("id")
        calendar_url = event.get("htmlLink", "")
        
        meet_url = ""
        conf_data = event.get("conferenceData", {})
        entry_points = conf_data.get("entryPoints", [])
        for ep in entry_points:
            if ep.get("entryPointType") == "video":
                meet_url = ep.get("uri", "")
                break

        return {
            "success": True,
            "eventId": event_id,
            "meetUrl": meet_url or calendar_url,  # Fallback to calendar link if conferencing is still provisioning
            "calendarUrl": calendar_url
        }
    except Exception as e:
        raise Exception(f"Google Calendar API failed: {str(e)}")
