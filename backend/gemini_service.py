import os
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any

# Attempt to import google-genai
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# If API key is empty, check for GOOGLE_API_KEY as well
if not GEMINI_API_KEY:
    GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "")

def get_heuristic_response(message: str) -> Dict[str, Any]:
    """
    Fallback natural language parser for generating widgets locally
    if the Gemini API key is missing or fails.
    """
    msg_lower = message.lower()
    
    # 1. Budget Allocation -> BudgetWidget
    if any(keyword in msg_lower for keyword in ["budget", "allocate", "lakh", "crore", "fund", "money", "cost"]):
        amount = 50000
        # Parse Indian numbering / lakh
        lakh_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:lakh|lakhs)", msg_lower)
        if lakh_match:
            amount = int(float(lakh_match.group(1)) * 100000)
        else:
            digits = re.findall(r"\d+", msg_lower)
            if digits:
                # Use the largest number found
                amount = max(int(d) for d in digits)
        
        # Category heuristic
        category = "Civil"
        if "electrical" in msg_lower or "wire" in msg_lower:
            category = "Electrical"
        elif "plumb" in msg_lower or "pipe" in msg_lower:
            category = "Plumbing"
        elif "steel" in msg_lower or "cement" in msg_lower:
            category = "Material"
        elif "interior" in msg_lower or "paint" in msg_lower:
            category = "Finishing"
            
        # Project heuristic
        project = "Foundation Work"
        project_match = re.search(r"(?:for|on)\s+([a-zA-Z\s]+?)(?:\s+budget|\s+allocation|\.|\b|$)", message, re.IGNORECASE)
        if project_match:
            project = project_match.group(1).strip().title()

        return {
            "responseType": "widget",
            "widget": "BudgetWidget",
            "message": f"I've prepared the budget allocation widget for '{project}'. Please review and save.",
            "props": {
                "project": project,
                "amount": amount,
                "category": category
            }
        }

    # 2. Add Worker -> WorkerWidget
    if any(keyword in msg_lower for keyword in ["worker", "engineer", "carpenter", "plumber", "electrician", "labor", "mason", "hire", "add"]):
        # Find phone number
        phone = "9876543210"
        phone_match = re.search(r"\b\d{10}\b", msg_lower)
        if phone_match:
            phone = phone_match.group(0)
            
        # Role heuristic
        role = "Mason"
        for r in ["engineer", "carpenter", "plumber", "electrician", "supervisor", "mason", "helper", "painter"]:
            if r in msg_lower:
                role = r.capitalize()
                break
                
        # Salary heuristic
        salary = 18000
        salary_match = re.search(r"(?:salary|wage|pay|rate)\s+(?:of\s+)?(\d+)", msg_lower)
        if salary_match:
            salary = float(salary_match.group(1))
        else:
            # find any number that is not phone
            nums = [int(n) for n in re.findall(r"\b\d+\b", msg_lower) if len(n) < 8]
            if nums:
                salary = float(nums[0])

        # Name heuristic (Capitalized words that aren't keywords)
        name = "Rajesh Kumar"
        words = re.findall(r"\b[A-Z][a-z]+\b", message)
        # Filter out common starting sentence words
        ignore = ["Add", "Create", "Draft", "Notify", "Plan", "Worker", "Engineer", "I", "He", "She"]
        name_words = [w for w in words if w not in ignore]
        if len(name_words) >= 2:
            name = f"{name_words[0]} {name_words[1]}"
        elif len(name_words) == 1:
            name = name_words[0]

        return {
            "responseType": "widget",
            "widget": "WorkerWidget",
            "message": f"Sure, I've filled out the worker registration form for {name}.",
            "props": {
                "name": name,
                "role": role,
                "phone": phone,
                "salary": salary,
                "status": "Active"
            }
        }

    # 3. Draft Email -> EmailWidget
    if any(keyword in msg_lower for keyword in ["email", "draft", "mail", "send email"]):
        to = "all-workers@site.com"
        if "engineer" in msg_lower:
            to = "engineers@site.com"
        elif "client" in msg_lower:
            to = "client@construction.com"
        elif "vendor" in msg_lower:
            to = "vendor@supplies.com"
            
        subject = "Project Update & Site Alert"
        subject_match = re.search(r"email\s+(?:about|regarding)\s+([a-zA-Z\s]+)", msg_lower)
        if subject_match:
            subject = subject_match.group(1).strip().title()

        body = "Hello Team,\n\nPlease find the project updates and guidelines for the upcoming site activities. Let's ensure safety protocols are followed.\n\nRegards,\nSite Manager"

        return {
            "responseType": "widget",
            "widget": "EmailWidget",
            "message": "I've drafted the email for you. You can review and update the content before sending.",
            "props": {
                "to": to,
                "subject": subject,
                "body": body
            }
        }

    # 4. Todo/Safety Checklist -> TodoWidget
    if any(keyword in msg_lower for keyword in ["todo", "task", "checklist", "safety", "to-do", "check list"]):
        task = "Verify Safety Gear and Helmets"
        if "leak" in msg_lower:
            task = "Repair water leak in Block A"
        elif "concrete" in msg_lower:
            task = "Supervise slab concreting"
        elif "wire" in msg_lower:
            task = "Inspect electrical wiring routing"
        elif "checklist" in msg_lower:
            task = "Complete daily site safety inspection"
            
        due_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        if "today" in msg_lower:
            due_date = datetime.now().strftime("%Y-%m-%d")
        elif "next week" in msg_lower:
            due_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

        assigned_to = "Site Supervisor"
        if "engineer" in msg_lower:
            assigned_to = "Lead Engineer"
        elif "worker" in msg_lower:
            assigned_to = "Senior Laborer"

        return {
            "responseType": "widget",
            "widget": "TodoWidget",
            "message": "I've drafted a todo item for your project task list.",
            "props": {
                "task": task,
                "dueDate": due_date,
                "assignedTo": assigned_to,
                "status": "Pending"
            }
        }

    # 5. Notify workers -> NotificationWidget
    if any(keyword in msg_lower for keyword in ["notify", "notification", "broadcast", "alert", "warn"]):
        recipient = "All Site Workers"
        if "engineer" in msg_lower:
            recipient = "Site Engineers"
        elif "contractor" in msg_lower:
            recipient = "Contractors"

        title = "Safety Alert: Weather Warning"
        if "concrete" in msg_lower:
            title = "Notice: Slab Concreting Schedule"
        elif "meeting" in msg_lower:
            title = "Notice: Site Safety Meeting"

        message_body = "Heavy rain expected tomorrow. Please secure all electrical equipment and wear safety harnesses."

        return {
            "responseType": "widget",
            "widget": "NotificationWidget",
            "message": "I've drafted a broadcast notification. Click Save to send it to the workspace feed.",
            "props": {
                "recipient": recipient,
                "title": title,
                "message": message_body,
                "severity": "Warning" if "warn" in msg_lower or "alert" in msg_lower else "Info"
            }
        }

    # 6. Schedule Meeting -> MeetingWidget
    if any(keyword in msg_lower for keyword in ["meeting", "conference", "discuss", "sync"]):
        title = "Site Coordination Meeting"
        if "safety" in msg_lower:
            title = "Daily Toolbox Safety Sync"
        elif "client" in msg_lower:
            title = "Client Progress Review"

        date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        time = "10:00"
        agenda = "Review daily progress milestones, address site safety incidents, and resolve material delays."

        return {
            "responseType": "widget",
            "widget": "MeetingWidget",
            "message": "I have created the meeting invitation form with the schedule details.",
            "props": {
                "title": title,
                "date": date,
                "time": time,
                "agenda": agenda
            }
        }

    # 7. Plan/Schedule Work -> ScheduleWidget
    if any(keyword in msg_lower for keyword in ["plan", "schedule", "work", "timeline"]):
        activity = "Concrete Slab Casting"
        if "excavat" in msg_lower:
            activity = "Foundation Excavation"
        elif "brick" in msg_lower:
            activity = "Brickwork Block B"
        elif "paint" in msg_lower:
            activity = "Exterior Painting"

        start_date = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        end_date = (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d")
        
        assigned_team = "Civil Team A"
        if "electrical" in msg_lower:
            assigned_team = "Electrical Subcontractor"
        elif "plumb" in msg_lower:
            assigned_team = "Plumbing Team"

        return {
            "responseType": "widget",
            "widget": "ScheduleWidget",
            "message": "I've created a work schedule card for this project milestone.",
            "props": {
                "activity": activity,
                "startDate": start_date,
                "endDate": end_date,
                "assignedTeam": assigned_team
            }
        }

    # 8. Inventory/Materials -> InventoryWidget
    if any(keyword in msg_lower for keyword in ["inventory", "material", "cement", "steel", "sand", "brick", "stock", "quantity"]):
        item_name = "Cement OPC 53 Grade"
        quantity = 500
        unit = "Bags"

        if "steel" in msg_lower:
            item_name = "TMT Steel Bars 12mm"
            quantity = 10
            unit = "Tons"
        elif "sand" in msg_lower:
            item_name = "River Sand"
            quantity = 2
            unit = "Brass"
        elif "brick" in msg_lower:
            item_name = "Red Clay Bricks"
            quantity = 5000
            unit = "Nos"

        # Regex for quantities
        qty_match = re.search(r"(\d+)\s*(?:bags|tons|brass|bricks|nos)?", msg_lower)
        if qty_match:
            quantity = float(qty_match.group(1))

        return {
            "responseType": "widget",
            "widget": "InventoryWidget",
            "message": f"I've initiated the inventory update form for {item_name}.",
            "props": {
                "itemName": item_name,
                "quantity": quantity,
                "unit": unit,
                "status": "In Stock"
            }
        }

    # Text Response fallback
    return {
        "responseType": "text",
        "widget": None,
        "message": "Hello! I am your Construction Workspace Assistant. You can tell me naturally to perform tasks, like 'Add worker Rohan', 'Allocate 15 lakh for concrete', 'Create a safety checklist', 'Plan concrete work', or 'Notify site engineers'. How can I help you today?",
        "props": None
    }

async def generate_response(prompt: str) -> Dict[str, Any]:
    """
    Sends the user prompt to Gemini to parse into a structured text or widget response.
    Falls back to a robust rule-based model if Gemini is unconfigured/fails.
    """
    if not GEMINI_AVAILABLE or not GEMINI_API_KEY:
        return get_heuristic_response(prompt)

    try:
        # Using the official modern google-genai client
        client = genai.Client(api_key=GEMINI_API_KEY)
        
        system_instruction = (
            "You are an AI assistant driving an interactive Construction Management Workspace.\n"
            "Your interface can dynamically render widgets inside the chat to handle operations.\n\n"
            "The supported widgets and their configurations are:\n"
            "1. WorkerWidget: To add/update site workers.\n"
            "   Props: { \"name\": str, \"role\": str, \"phone\": str, \"salary\": float, \"status\": str (usually 'Active' or 'On Leave') }\n"
            "2. BudgetWidget: To allocate or track budgets.\n"
            "   Props: { \"project\": str, \"amount\": float, \"category\": str (e.g. Civil, Electrical, Plumbing, Material, etc.) }\n"
            "3. EmailWidget: To draft formal correspondence to workers, vendors, clients.\n"
            "   Props: { \"to\": str, \"subject\": str, \"body\": str }\n"
            "4. TodoWidget: To create checklist items or site tasks.\n"
            "   Props: { \"task\": str, \"dueDate\": str (YYYY-MM-DD), \"assignedTo\": str, \"status\": str ('Pending' or 'Completed') }\n"
            "5. NotificationWidget: To draft site-wide announcements, safety alerts, weather updates.\n"
            "   Props: { \"recipient\": str, \"title\": str, \"message\": str, \"severity\": str ('Info', 'Warning', 'Alert') }\n"
            "6. MeetingWidget: To organize client briefings, progress syncs, or daily toolbox talks.\n"
            "   Props: { \"title\": str, \"date\": str (YYYY-MM-DD), \"time\": str (HH:MM), \"agenda\": str }\n"
            "7. ScheduleWidget: To plan construction work milestones and schedules.\n"
            "   Props: { \"activity\": str, \"startDate\": str (YYYY-MM-DD), \"endDate\": str (YYYY-MM-DD), \"assignedTeam\": str }\n"
            "8. InventoryWidget: To audit or update materials/supplies in stock.\n"
            "   Props: { \"itemName\": str, \"quantity\": float, \"unit\": str (e.g. Bags, Tons, Nos, Meters), \"status\": str ('In Stock', 'Low', 'Out of Stock') }\n\n"
            "CRITICAL BEHAVIOR:\n"
            "- If the user specifies any action indicating creation, planning, scheduling, updating, writing, notifying, or allocation relating to these 8 entities, you MUST output responseType: 'widget' and fill out the fields. Otherwise, if it is a general question or greeting, return responseType: 'text'.\n"
            "- Provide a helpful, concise accompanying conversational message in the 'message' field.\n"
            "- Do NOT generate any HTML. The frontend handles the rendering.\n"
            "- Do NOT return extra keys. Strictly follow the schema."
        )

        prompt_message = f"User Request: {prompt}\n\nAnalyze and return structured JSON."

        # Define schema for structured JSON output
        response_schema = {
            "type": "OBJECT",
            "properties": {
                "responseType": {
                    "type": "STRING",
                    "enum": ["text", "widget"]
                },
                "widget": {
                    "type": "STRING",
                    "enum": [
                        "WorkerWidget",
                        "BudgetWidget",
                        "EmailWidget",
                        "TodoWidget",
                        "NotificationWidget",
                        "MeetingWidget",
                        "ScheduleWidget",
                        "InventoryWidget"
                    ],
                    "nullable": True
                },
                "message": {
                    "type": "STRING",
                    "description": "Text response or introduction message to accompany the widget."
                },
                "props": {
                    "type": "OBJECT",
                    "description": "Properties for the widget. Null if responseType is 'text'.",
                    "nullable": True
                }
            },
            "required": ["responseType", "widget", "message", "props"]
        }

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt_message,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=response_schema,
                temperature=0.1
            )
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Gemini API call failed, falling back to heuristics: {e}")
        return get_heuristic_response(prompt)
