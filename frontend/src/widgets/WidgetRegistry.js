import WorkerWidget from "./WorkerWidget";
import BudgetWidget from "./BudgetWidget";
import EmailWidget from "./EmailWidget";
import TodoWidget from "./TodoWidget";
import NotificationWidget from "./NotificationWidget";
import MeetingWidget from "./MeetingWidget";
import ScheduleWidget from "./ScheduleWidget";
import InventoryWidget from "./InventoryWidget";

import { 
  User, 
  DollarSign, 
  Mail, 
  CheckSquare, 
  Bell, 
  Calendar, 
  Clock, 
  Package 
} from "lucide-react";

export const WidgetRegistry = {
  WorkerWidget: {
    component: WorkerWidget,
    title: "Add Worker",
    icon: User,
    category: "workers",
    summaryFields: [
      { label: "Name", key: "name" },
      { label: "Role", key: "role" },
      { label: "Phone", key: "phone" },
      { label: "Salary", key: "salary", format: (v) => `₹${Number(v).toLocaleString()}/mo` },
      { label: "Status", key: "status" }
    ]
  },
  BudgetWidget: {
    component: BudgetWidget,
    title: "Allocate Budget",
    icon: DollarSign,
    category: "budgets",
    summaryFields: [
      { label: "Project", key: "project" },
      { label: "Amount", key: "amount", format: (v) => `₹${Number(v).toLocaleString()}` },
      { label: "Category", key: "category" }
    ]
  },
  EmailWidget: {
    component: EmailWidget,
    title: "Draft Email",
    icon: Mail,
    category: "emails",
    summaryFields: [
      { label: "To", key: "to" },
      { label: "Subject", key: "subject" },
      { label: "Body", key: "body", format: (v) => v.length > 60 ? v.substring(0, 57) + "..." : v }
    ]
  },
  TodoWidget: {
    component: TodoWidget,
    title: "Create Task",
    icon: CheckSquare,
    category: "todos",
    summaryFields: [
      { label: "Task", key: "task" },
      { label: "Due Date", key: "dueDate" },
      { label: "Assigned To", key: "assignedTo" },
      { label: "Status", key: "status" }
    ]
  },
  NotificationWidget: {
    component: NotificationWidget,
    title: "Broadcast Notification",
    icon: Bell,
    category: "notifications",
    summaryFields: [
      { label: "Recipient", key: "recipient" },
      { label: "Title", key: "title" },
      { label: "Message", key: "message", format: (v) => v.length > 60 ? v.substring(0, 57) + "..." : v },
      { label: "Severity", key: "severity" }
    ]
  },
  MeetingWidget: {
    component: MeetingWidget,
    title: "Schedule Meeting",
    icon: Calendar,
    category: "meetings",
    summaryFields: [
      { label: "Meeting Title", key: "title" },
      { label: "Date", key: "date" },
      { label: "Time", key: "time" },
      { label: "Agenda", key: "agenda", format: (v) => v.length > 60 ? v.substring(0, 57) + "..." : v }
    ]
  },
  ScheduleWidget: {
    component: ScheduleWidget,
    title: "Work Schedule",
    icon: Clock,
    category: "schedules",
    summaryFields: [
      { label: "Activity", key: "activity" },
      { label: "Start Date", key: "startDate" },
      { label: "End Date", key: "endDate" },
      { label: "Assigned Team", key: "assignedTeam" }
    ]
  },
  InventoryWidget: {
    component: InventoryWidget,
    title: "Update Inventory",
    icon: Package,
    category: "inventory",
    summaryFields: [
      { label: "Item Name", key: "itemName" },
      { label: "Quantity", key: "quantity", format: (v, item) => `${v} ${item.unit || ""}` },
      { label: "Status", key: "status" }
    ]
  }
};
