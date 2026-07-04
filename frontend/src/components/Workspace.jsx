import React, { useState } from "react";
import { useProject } from "../context/ProjectContext";
import { 
  User, 
  DollarSign, 
  Mail, 
  CheckSquare, 
  Bell, 
  Calendar, 
  Clock, 
  Package, 
  Map, 
  Trash2,
  HardHat
} from "lucide-react";

const Workspace = () => {
  const project = useProject();
  const [activeTab, setActiveTab] = useState("workers");

  // Tabs metadata
  const tabs = [
    { id: "workers", label: "Workers", icon: User, category: "workers", data: project.workers },
    { id: "budgets", label: "Budgets", icon: DollarSign, category: "budgets", data: project.budgets },
    { id: "emails", label: "Emails", icon: Mail, category: "emails", data: project.emails },
    { id: "todos", label: "Todos", icon: CheckSquare, category: "todos", data: project.todos },
    { id: "notifications", label: "Notifications", icon: Bell, category: "notifications", data: project.notifications },
    { id: "meetings", label: "Meetings", icon: Calendar, category: "meetings", data: project.meetings },
    { id: "schedules", label: "Schedules", icon: Clock, category: "schedules", data: project.schedules },
    { id: "inventory", label: "Inventory", icon: Package, category: "inventory", data: project.inventory },
    { id: "floorplan", label: "Floor Plan", icon: Map, category: "floorplan", data: [] }
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  // Delete Action with Confirmation
  const handleDelete = async (category, itemId, itemTitle) => {
    const message = `Are you sure you want to delete "${itemTitle}"?\n\nThis will remove the MongoDB record, remove the item from this workspace, and remove any active widgets linked to this item in the chat history.`;
    if (window.confirm(message)) {
      try {
        await project.deleteWorkspaceItem(category, itemId);
      } catch (err) {
        alert("Failed to delete item: " + err.message);
      }
    }
  };

  // Render specific item details
  const renderItemCard = (tabId, item) => {
    switch (tabId) {
      case "workers":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.name}</h4>
                <span className="item-subtitle">{item.role}</span>
              </div>
              <span className={`tag ${item.status === "Active" ? "tag-success" : "tag-danger"}`}>
                {item.status}
              </span>
            </div>
            <div className="item-meta-grid">
              <span className="meta-label">Phone:</span>
              <span className="meta-value">{item.phone}</span>
              <span className="meta-label">Monthly Salary:</span>
              <span className="meta-value">₹{Number(item.salary).toLocaleString()}</span>
            </div>
            <button 
              onClick={() => handleDelete("workers", item.id, item.name)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );
      
      case "budgets":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.project}</h4>
                <span className="item-subtitle">Budget Allocation</span>
              </div>
              <span className="tag tag-info">{item.category}</span>
            </div>
            <div className="item-meta-grid">
              <span className="meta-label">Allocated Capital:</span>
              <span className="meta-value" style={{ fontWeight: 600, color: "#f59e0b" }}>
                ₹{Number(item.amount).toLocaleString()}
              </span>
            </div>
            <button 
              onClick={() => handleDelete("budgets", item.id, item.project)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );

      case "emails":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title" style={{ maxWidth: "260px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {item.subject}
                </h4>
                <span className="item-subtitle">To: {item.to}</span>
              </div>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#9ca3af", background: "rgba(0,0,0,0.1)", padding: "8px", borderRadius: "4px", whiteSpace: "pre-line" }}>
              {item.body}
            </div>
            <button 
              onClick={() => handleDelete("emails", item.id, item.subject)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );

      case "todos":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.task}</h4>
                <span className="item-subtitle">Assigned to: {item.assignedTo}</span>
              </div>
              <span className={`tag ${item.status === "Completed" ? "tag-success" : "tag-warning"}`}>
                {item.status}
              </span>
            </div>
            <div className="item-meta-grid">
              <span className="meta-label">Due Date:</span>
              <span className="meta-value">{item.dueDate}</span>
            </div>
            <button 
              onClick={() => handleDelete("todos", item.id, item.task)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );

      case "notifications":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.title}</h4>
                <span className="item-subtitle">For: {item.recipient}</span>
              </div>
              <span className={`tag ${item.severity === "Alert" ? "tag-danger" : item.severity === "Warning" ? "tag-warning" : "tag-info"}`}>
                {item.severity}
              </span>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{item.message}</p>
            <button 
              onClick={() => handleDelete("notifications", item.id, item.title)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );

      case "meetings":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.title}</h4>
                <span className="item-subtitle">Coordination Sync</span>
              </div>
            </div>
            <div className="item-meta-grid">
              <span className="meta-label">Schedule:</span>
              <span className="meta-value">{item.date} at {item.time}</span>
              <span className="meta-label">Agenda:</span>
              <span className="meta-value" style={{ gridColumn: "span 2", textAlign: "left", whiteSpace: "normal" }}>
                {item.agenda}
              </span>
            </div>
            <button 
              onClick={() => handleDelete("meetings", item.id, item.title)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );

      case "schedules":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.activity}</h4>
                <span className="item-subtitle">Assigned: {item.assignedTeam}</span>
              </div>
            </div>
            <div className="item-meta-grid">
              <span className="meta-label">Start Date:</span>
              <span className="meta-value">{item.startDate}</span>
              <span className="meta-label">End Date:</span>
              <span className="meta-value">{item.endDate}</span>
            </div>
            <button 
              onClick={() => handleDelete("schedules", item.id, item.activity)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );

      case "inventory":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.itemName}</h4>
                <span className="item-subtitle">Audit Record</span>
              </div>
              <span className={`tag ${item.status === "In Stock" ? "tag-success" : item.status === "Low" ? "tag-warning" : "tag-danger"}`}>
                {item.status}
              </span>
            </div>
            <div className="item-meta-grid">
              <span className="meta-label">Stock Level:</span>
              <span className="meta-value">{item.quantity} {item.unit}</span>
            </div>
            <button 
              onClick={() => handleDelete("inventory", item.id, item.itemName)} 
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="workspace-panel">
      {/* Workspace Header */}
      <div className="workspace-header">
        <div className="workspace-title">
          <HardHat size={22} style={{ color: "#10b981" }} />
          <span>Site Dashboard</span>
        </div>
        <p className="workspace-subtitle">Persistent Workspace Data Storage</p>
      </div>

      {/* Horizontal Tabs Navigation */}
      <div className="workspace-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`workspace-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <IconComponent size={14} />
              <span>{tab.label}</span>
              {tab.data.length > 0 && (
                <span style={{ 
                  background: activeTab === tab.id ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  color: activeTab === tab.id ? "#3b82f6" : "#9ca3af",
                  fontSize: "0.7rem", 
                  padding: "1px 5px", 
                  borderRadius: "9999px",
                  fontWeight: 600
                }}>
                  {tab.data.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Workspace Active Section Contents */}
      <div className="workspace-content">
        {activeTab === "floorplan" ? (
          <div className="section-empty" style={{ borderStyle: "solid" }}>
            <Map size={36} />
            <h4 style={{ color: "#f3f4f6" }}>Floor Plan Viewer</h4>
            <p style={{ fontSize: "0.8rem", maxWidth: "260px" }}>
              Interactive blueprint blueprint visualizer is planned for Phase 2. Upload CAD drawings to view.
            </p>
          </div>
        ) : (
          <div className="section-container">
            <div className="section-header">
              <div className="section-title-wrap">
                <h3>{currentTab.label} Directory</h3>
              </div>
            </div>

            {currentTab.data.length === 0 ? (
              <div className="section-empty">
                <currentTab.icon size={28} />
                <p style={{ fontSize: "0.85rem" }}>
                  No {currentTab.label.toLowerCase()} in project database.
                </p>
                <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                  Ask AI: "Add a new {currentTab.label.toLowerCase().slice(0, -1)}"
                </span>
              </div>
            ) : (
              currentTab.data.map((item) => renderItemCard(activeTab, item))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workspace;
