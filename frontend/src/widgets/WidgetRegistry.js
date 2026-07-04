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
  createWorker: { category: "workers", icon: User, title: "Worker Registration" },
  createBudget: { category: "budgets", icon: DollarSign, title: "Budget Allocation" },
  sendEmail: { category: "emails", icon: Mail, title: "Draft Email" },
  createTodo: { category: "todos", icon: CheckSquare, title: "Create Task" },
  sendNotification: { category: "notifications", icon: Bell, title: "Broadcast Announcement" },
  scheduleMeeting: { category: "meetings", icon: Calendar, title: "Meeting Invitation" },
  createSchedule: { category: "schedules", icon: Clock, title: "Work Schedule" },
  createInventory: { category: "inventory", icon: Package, title: "Material Inventory" },
};

export const getActionConfig = (action) => {
  return WidgetRegistry[action] || { category: "todos", icon: CheckSquare, title: "Project Item" };
};
