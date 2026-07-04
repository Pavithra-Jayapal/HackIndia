from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Worker Model
class WorkerModel(BaseModel):
    name: str
    role: str
    phone: str
    salary: float
    status: str = "Active"

# Budget Model
class BudgetModel(BaseModel):
    project: str
    amount: float
    category: str

# Email Model
class EmailModel(BaseModel):
    to: str
    subject: str
    body: str

# Todo Model
class TodoModel(BaseModel):
    task: str
    dueDate: str
    assignedTo: str
    status: str = "Pending"

# Notification Model
class NotificationModel(BaseModel):
    recipient: str
    title: str
    message: str
    severity: str = "Info"

# Meeting Model
class MeetingModel(BaseModel):
    title: str
    date: str
    time: str
    agenda: str

# Schedule Model
class ScheduleModel(BaseModel):
    activity: str
    startDate: str
    endDate: str
    assignedTeam: str

# Inventory Model
class InventoryModel(BaseModel):
    itemName: str
    quantity: float
    unit: str
    status: str = "In Stock"

# Widget Sub-model
class WidgetState(BaseModel):
    type: str
    props: Dict[str, Any]
    status: str = "active"  # "active", "saved", "archived"
    dataId: Optional[str] = None

# Chat Message Model
class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    text: str
    widget: Optional[WidgetState] = None

# Chat Request Model
class ChatRequest(BaseModel):
    message: str
