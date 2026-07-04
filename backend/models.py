from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import time

# Base model with project metadata
class ProjectBaseModel(BaseModel):
    id: Optional[str] = None
    createdAt: Optional[float] = Field(default_factory=time.time)
    updatedAt: Optional[float] = Field(default_factory=time.time)
    version: int = 1

# Worker Model
class WorkerModel(ProjectBaseModel):
    name: str
    role: str
    phone: str
    salary: float
    status: str = "Active"

# Budget Model
class BudgetModel(ProjectBaseModel):
    project: str
    amount: float
    category: str

# Email Model
class EmailModel(ProjectBaseModel):
    to: str
    subject: str
    body: str

# Todo Model
class TodoModel(ProjectBaseModel):
    task: str
    dueDate: str
    assignedTo: str
    status: str = "Pending"

# Notification Model
class NotificationModel(ProjectBaseModel):
    recipient: str
    title: str
    message: str
    severity: str = "Info"

# Meeting Model
class MeetingModel(ProjectBaseModel):
    title: str
    date: str
    time: str
    agenda: str

# Schedule Model
class ScheduleModel(ProjectBaseModel):
    activity: str
    startDate: str
    endDate: str
    assignedTeam: str

# Inventory Model
class InventoryModel(ProjectBaseModel):
    itemName: str
    quantity: float
    unit: str
    status: str = "In Stock"

# Chat Message Widget State
class WidgetState(BaseModel):
    type: str  # "form"
    title: str
    fields: List[Dict[str, Any]]
    buttons: List[Dict[str, Any]]
    status: str = "active"  # "active", "saved", "archived"
    dataId: Optional[str] = None
    submittedData: Optional[Dict[str, Any]] = None

# Chat Message Model
class ChatMessage(ProjectBaseModel):
    role: str  # "user" or "model"
    text: str
    widget: Optional[WidgetState] = None

# Chat Request Model
class ChatRequest(BaseModel):
    message: str
    conversationId: Optional[str] = None
