import os
import json
import re
import asyncio
from typing import Dict, Any

try:
    from google import genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

async def generate_response(prompt: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Sends the prompt along with complete workspace memory (context) to Gemini 2.5 Flash.
    Returns structured JSON with responseType: 'text' or 'widget' (dynamic form).
    If Gemini fails, returns a conversational text error message without keyword fallback.
    """
    api_key = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    if not GEMINI_AVAILABLE or not api_key:
        return {
            "responseType": "text",
            "message": "Connection to the Gemini API is unconfigured. Please provide a valid GEMINI_API_KEY in backend/.env."
        }

    try:
        # 1. Compile current database collection states as context lists
        workers_ctx = ""
        budgets_ctx = ""
        inventory_ctx = ""
        meetings_ctx = ""
        emails_ctx = ""
        todos_ctx = ""
        schedules_ctx = ""
        notifications_ctx = ""
        chat_logs_ctx = ""

        if context:
            if "workers" in context and context["workers"]:
                workers_ctx = "\n".join([f"- Worker: name='{w.get('name', 'N/A')}', role='{w.get('role', 'N/A')}', phone='{w.get('phone', 'N/A')}', salary={w.get('salary', 0)}, status='{w.get('status', 'Active')}'" for w in context["workers"]])
            if "budgets" in context and context["budgets"]:
                budgets_ctx = "\n".join([f"- Budget: project='{b.get('project', 'N/A')}', amount={b.get('amount', 0)}, category='{b.get('category', 'General')}'" for b in context["budgets"]])
            if "inventory" in context and context["inventory"]:
                inventory_ctx = "\n".join([f"- Inventory: item='{i.get('itemName', 'N/A')}', qty={i.get('quantity', 0)}, unit='{i.get('unit', 'pcs')}', status='{i.get('status', 'In Stock')}'" for i in context["inventory"]])
            if "meetings" in context and context["meetings"]:
                meetings_ctx = "\n".join([f"- Meeting: title='{m.get('title', 'N/A')}', date='{m.get('date', 'N/A')}', time='{m.get('time', 'N/A')}', agenda='{m.get('agenda', 'N/A')}'" for m in context["meetings"]])
            if "emails" in context and context["emails"]:
                emails_ctx = "\n".join([f"- Email: to='{e.get('to', 'N/A')}', subject='{e.get('subject', 'No Subject')}'" for e in context["emails"]])
            if "todos" in context and context["todos"]:
                todos_ctx = "\n".join([f"- Task: task='{t.get('task', 'N/A')}', dueDate='{t.get('dueDate', 'N/A')}', assignedTo='{t.get('assignedTo', 'N/A')}', status='{t.get('status', 'Pending')}'" for t in context["todos"]])
            if "schedules" in context and context["schedules"]:
                schedules_ctx = "\n".join([f"- Schedule: activity='{s.get('activity', 'N/A')}', startDate='{s.get('startDate', 'N/A')}', endDate='{s.get('endDate', 'N/A')}', assignedTeam='{s.get('assignedTeam', 'N/A')}'" for s in context["schedules"]])
            if "notifications" in context and context["notifications"]:
                notifications_ctx = "\n".join([f"- Alert: recipient='{n.get('recipient', 'N/A')}', title='{n.get('title', 'N/A')}', severity='{n.get('severity', 'Info')}'" for n in context["notifications"]])
            if "chat_history" in context and context["chat_history"]:
                chat_logs_ctx = "\n".join([f"[{msg.get('role', 'user').upper()}]: {msg.get('text', '')}" for msg in context["chat_history"][-8:]])

        system_instruction = (
            "You are a Senior Construction Assistant AI Reasoning Engine driving a Construction Management Workspace.\n"
            "You coordinate workspace memory, forms, and logs.\n\n"
            "WORKSPACE MEMORY:\n"
            f"=== CURRENT WORKERS ===\n{workers_ctx}\n\n"
            f"=== CURRENT BUDGETS ===\n{budgets_ctx}\n\n"
            f"=== CURRENT INVENTORY ===\n{inventory_ctx}\n\n"
            f"=== CURRENT TASKS ===\n{todos_ctx}\n\n"
            f"=== CURRENT SCHEDULES ===\n{schedules_ctx}\n\n"
            f"=== CURRENT MEETINGS ===\n{meetings_ctx}\n\n"
            f"=== CURRENT DRAFT EMAILS ===\n{emails_ctx}\n\n"
            f"=== CURRENT BROADCAST ALERTS ===\n{notifications_ctx}\n\n"
            f"=== CONVERSATION LOGS ===\n{chat_logs_ctx}\n\n"
            "CORE BEHAVIORS:\n"
            "1. Resolve pronouns and contextual references (like 'it', 'allocate another', 'assign them') against conversation logs and current data tables.\n"
            "2. Decide if the request is a simple query/greeting (respond with responseType: 'text') OR if a form/widget is needed to capture/verify item details (respond with responseType: 'widget').\n"
            "3. If a form is needed, construct a dynamic form schema tailored to the user's intent. Do NOT select from predefined widgets. Specify the fields, labels, input types, and pre-fill values from the user's prompt.\n"
            "4. Buttons action must map exactly to one of these: 'createWorker', 'createBudget', 'createTodo', 'createInventory', 'scheduleMeeting', 'sendEmail', 'sendNotification', 'createSchedule'.\n"
            "5. CRITICAL: If button action is 'scheduleMeeting', the form fields MUST be named exactly: 'title', 'date', 'time', 'attendees', and 'agenda'.\n"
            "6. CRITICAL: If button action is 'sendEmail', the form fields MUST be named exactly: 'to', 'subject', and 'body'.\n"
            "7. CRITICAL: If button action is 'createWorker', the field named 'role' MUST have type: 'select' and 'options' containing: 'Supervisor', 'Carpenter', 'Mason', 'Electrician', 'Plumber', 'Painter', 'Welder', 'Laborer', 'Foreman', 'Project Manager', 'Helper'.\n\n"
            "FORM JSON SCHEMA SPECIFICATION:\n"
            "If responseType is 'widget', you must construct the 'widget' object containing:\n"
            "- 'type': always 'form'\n"
            "- 'title': title of the form card (e.g. 'Register Worker', 'Allocate Project Capital')\n"
            "- 'fields': Array of field descriptors:\n"
            "  - 'name': key name for database mapping (e.g. 'name', 'salary', 'project', 'amount', 'dueDate')\n"
            "  - 'label': text label shown above input (e.g. 'Full Name', 'Monthly Salary (₹)')\n"
            "  - 'type': input widget type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'tel'\n"
            "  - 'value': default/pre-filled value parsed from prompt, or default baseline values\n"
            "  - 'options': Array of strings (required only for type='select')\n"
            "  - 'placeholder': string describing field details\n"
            "  - 'required': boolean\n"
            "- 'buttons': Array of submit buttons:\n"
            "  - 'label': button label (e.g. 'Save Profile', 'Allocate')\n"
            "  - 'action': 'createWorker' | 'createBudget' | 'createTodo' | 'createInventory' | 'scheduleMeeting' | 'sendEmail' | 'sendNotification' | 'createSchedule'\n"
            "  - 'style': 'primary' | 'secondary' | 'danger'\n\n"
            "OUTPUT COMPLIANCE:\n"
            "- Output ONLY valid JSON matching the schema below. Never surround with markdown code blocks (e.g. ```json).\n"
            "- Never explain your reasoning, output raw JSON."
        )

        response_schema = {
            "type": "OBJECT",
            "properties": {
                "responseType": {
                    "type": "STRING",
                    "enum": ["text", "widget"]
                },
                "message": {
                    "type": "STRING",
                    "description": "Assistant text response explaining the output or conversational greetings."
                },
                "widget": {
                    "type": "OBJECT",
                    "properties": {
                        "type": {
                            "type": "STRING",
                            "enum": ["form"]
                        },
                        "title": {"type": "STRING"},
                        "fields": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "name": {"type": "STRING"},
                                    "label": {"type": "STRING"},
                                    "type": {
                                        "type": "STRING",
                                        "enum": ["text", "number", "select", "textarea", "date", "tel"]
                                    },
                                    "value": {
                                        "type": "STRING",
                                        "description": "Pre-filled default string/number",
                                        "nullable": True
                                    },
                                    "options": {
                                        "type": "ARRAY",
                                        "items": {"type": "STRING"},
                                        "nullable": True
                                    },
                                    "placeholder": {"type": "STRING", "nullable": True},
                                    "required": {"type": "BOOLEAN"}
                                },
                                "required": ["name", "label", "type", "required"]
                            }
                        },
                        "buttons": {
                            "type": "ARRAY",
                            "items": {
                                "type": "OBJECT",
                                "properties": {
                                    "label": {"type": "STRING"},
                                    "action": {
                                        "type": "STRING",
                                        "enum": [
                                            "createWorker", "createBudget", "createTodo", "createInventory",
                                            "scheduleMeeting", "sendEmail", "sendNotification", "createSchedule"
                                        ]
                                    },
                                    "style": {
                                        "type": "STRING",
                                        "enum": ["primary", "secondary", "danger"]
                                    }
                                },
                                "required": ["label", "action", "style"]
                            }
                        }
                    },
                    "required": ["type", "title", "fields", "buttons"],
                    "nullable": True
                }
            },
            "required": ["responseType", "message", "widget"]
        }
        from datetime import datetime
        global REQUEST_COUNTER
        if "REQUEST_COUNTER" not in globals():
            globals()["REQUEST_COUNTER"] = 0
        globals()["REQUEST_COUNTER"] += 1
        request_count = globals()["REQUEST_COUNTER"]
        
        timestamp = datetime.now().isoformat()
        prompt_len = len(prompt)
        system_instruction_len = len(system_instruction)
        total_prompt_size = prompt_len + system_instruction_len
        
        print(f"\n==================================================")
        print(f"🚀 GEMINI API REQUEST INITIATED")
        print(f"   Timestamp: {timestamp}")
        print(f"   Model: gemini-2.5-flash")
        print(f"   Prompt Size (chars): {prompt_len} (Instruction: {system_instruction_len})")
        print(f"   Total Approx Payload Size: {total_prompt_size} chars")
        print(f"   Global Request Count: {request_count}")
        print(f"==================================================\n")

        client = genai.Client(api_key=api_key)
        max_retries = 4
        base_delay = 2.0
        
        for attempt in range(max_retries):
            try:
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=f"User Prompt: {prompt}",
                    config=genai.types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        response_mime_type="application/json",
                        response_schema=response_schema,
                        temperature=0.15
                    )
                )
                
                # Clean up any accidental markdown tags if output was forced
                cleaned_text = response.text.strip()
                if cleaned_text.startswith("```"):
                    cleaned_text = re.sub(r"^```(?:json)?\n", "", cleaned_text)
                    cleaned_text = re.sub(r"\n```$", "", cleaned_text)
                    cleaned_text = cleaned_text.strip()
                
                print(f"\n==================================================")
                print(f"✅ GEMINI API REQUEST SUCCESS")
                print(f"   Timestamp: {datetime.now().isoformat()}")
                print(f"   Global Request Count: {request_count}")
                print(f"   Response Status: 200 OK")
                print(f"==================================================\n")
                
                return json.loads(cleaned_text)
                
            except Exception as e:
                # Log error details before applying backoff or failing
                timestamp_fail = datetime.now().isoformat()
                print(f"\n==================================================")
                print(f"❌ GEMINI API REQUEST FAILED (Attempt {attempt+1}/{max_retries})")
                print(f"   Timestamp: {timestamp_fail}")
                print(f"   Model: gemini-2.5-flash")
                print(f"   Error Message: {str(e)}")
                
                # Extract full fields from Google API Exception if available
                try:
                    if hasattr(e, "response") and e.response is not None:
                        print(f"   Response Status: {e.response.status_code}")
                        print(f"   Response Body: {e.response.text}")
                    elif hasattr(e, "code"):
                        print(f"   API Error Code: {e.code}")
                    if hasattr(e, "message"):
                        print(f"   API Message: {e.message}")
                except Exception as log_err:
                    print(f"   Could not inspect exception fields: {log_err}")
                print(f"==================================================\n")

                error_str = str(e)
                is_rate_limit = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower()
                is_daily_limit = "PerDay" in error_str or "limit: 20" in error_str or "daily" in error_str.lower()
                is_blocked = "limit: 0" in error_str

                if is_rate_limit and not is_daily_limit and not is_blocked and attempt < max_retries - 1:
                    # Exponential Backoff with Jitter
                    sleep_time = (base_delay * (2 ** attempt)) + (attempt * 0.5)
                    delay_match = re.search(r"retry in ([\d\.]+)\s*s", error_str, re.IGNORECASE)
                    if delay_match:
                        try:
                            sleep_time = float(delay_match.group(1)) + 0.5
                        except ValueError:
                            pass
                    
                    print(f"   [Backoff] Waiting {sleep_time:.2f} seconds before retrying...")
                    await asyncio.sleep(sleep_time)
                else:
                    raise e

    except Exception as e:
        error_str = str(e)
        is_429 = "429" in error_str or "RESOURCE_EXHAUSTED" in error_str or "quota" in error_str.lower()
        
        # Select user-facing resolution instructions
        if "limit: 0" in error_str:
            resolution = (
                "The Generative Language API is disabled/suspended for this Google Cloud project. "
                "AI Studio will allow you to generate API keys, but Google Cloud Console blocks execution. "
                "Resolution: Open Google Cloud Console, enable the 'Generative Language API' for this project, "
                "or create a key under a different new project in Google AI Studio."
            )
        elif "PerDay" in error_str or "limit: 20" in error_str or "daily" in error_str.lower():
            resolution = (
                "You have exceeded the request quota for this key in Google AI Studio. "
                "Resolution: Replace GEMINI_API_KEY in backend/.env with a paid-tier key, "
                "or wait for the quota to reset."
            )
        else:
            resolution = (
                "Verify your GEMINI_API_KEY in backend/.env is valid, has billing configured "
                "if using a paid tier, or create a fresh API key in Google AI Studio under a different project."
            )

        if is_429:
            return {
                "responseType": "widget",
                "message": "The Gemini reasoning engine has hit its free-tier API rate limits. Please check your developer billing options or try again later.",
                "widget": {
                    "type": "form",
                    "title": "API Quota Exhausted (429)",
                    "fields": [],
                    "buttons": [
                        {
                            "label": "View AI Studio Limits",
                            "action": "sendNotification",
                            "style": "secondary"
                        }
                    ],
                    "status": "saved",
                    "submittedData": {
                        "errorType": "Rate Limit / Quota Exhausted",
                        "details": error_str,
                        "resolution": resolution
                    }
                }
            }
        return {
            "responseType": "text",
            "message": f"Sorry, I encountered an internal error with the Gemini Reasoning Engine: {str(e)}."
        }
