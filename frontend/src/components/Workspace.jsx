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
  Trash2,
  HardHat
} from "lucide-react";

const Workspace = () => {
  const project = useProject();
  const [activeTab, setActiveTab] = useState("workers");
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);

  // Tabs metadata mapping collections
  const tabs = [
    { id: "workers", label: "Workers", icon: User, category: "workers", data: project.workers },
    { id: "budgets", label: "Budgets", icon: DollarSign, category: "budgets", data: project.budgets },
    { id: "inventory", label: "Inventory", icon: Package, category: "inventory", data: project.inventory },
    { id: "todos", label: "Todos", icon: CheckSquare, category: "todos", data: project.todos },
    { id: "schedules", label: "Schedules", icon: Clock, category: "schedules", data: project.schedules },
    { id: "meetings", label: "Meetings", icon: Calendar, category: "meetings", data: project.meetings },
    { id: "emails", label: "Emails", icon: Mail, category: "emails", data: project.emails },
    { id: "notifications", label: "Alerts", icon: Bell, category: "notifications", data: project.notifications },
  ];

  const currentTab = tabs.find(t => t.id === activeTab);

  // Delete Action with Confirmation
  const handleDelete = (category, itemId, itemTitle) => {
    setDeleteConfirmItem({ category, itemId, itemTitle });
  };

  // Render specific item details
  const renderItemCard = (tabId, item) => {
    switch (tabId) {
      case "workers": {
        const name = item.name || "N/A";
        const role = item.role || item.specialization || "N/A";
        const status = item.status || "Active";
        const phone = item.phone ?? "Not Provided";
        const email = item.email ?? "Not Provided";
        const contactDetails = item.contactDetails ?? "Not Provided";

        // Safety check for salary to prevent NaN
        const rawSalary = item.salary;
        const salaryVal = (rawSalary !== undefined && rawSalary !== null && rawSalary !== "") ? Number(rawSalary) : null;
        const salaryText = (salaryVal !== null && !isNaN(salaryVal)) ? `₹${salaryVal.toLocaleString()}` : "Not Provided";

        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{name}</h4>
                <span className="item-subtitle">{role}</span>
              </div>
              <span className={`tag ${status === "Active" ? "tag-success" : "tag-danger"}`}>
                {status}
              </span>
            </div>
            <div className="item-meta-grid">
              <span className="meta-label">Phone:</span>
              <span className="meta-value">{phone}</span>

              <span className="meta-label">Email:</span>
              <span className="meta-value">{email}</span>

              {("contactDetails" in item || item.contactDetails !== undefined) && (
                <>
                  <span className="meta-label">Contact Details:</span>
                  <span className="meta-value">{contactDetails}</span>
                </>
              )}

              {("salary" in item || item.salary !== undefined) && (
                <>
                  <span className="meta-label">Salary (Monthly):</span>
                  <span className="meta-value">{salaryText}</span>
                </>
              )}
            </div>
            <button
              onClick={() => handleDelete("workers", item.id, name)}
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem" }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        );
      }

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
              <span className="meta-label">Allocated capital:</span>
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

      case "todos":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.task}</h4>
                <span className="item-subtitle">Assignee: {item.assignedTo}</span>
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

      case "schedules":
        return (
          <div key={item.id} className="item-card">
            <div className="item-card-header">
              <div>
                <h4 className="item-title">{item.activity}</h4>
                <span className="item-subtitle">Team: {item.assignedTeam}</span>
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

            {/* Clickable links to Google Meet and Calendar */}
            <div style={{ marginTop: "8px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {item.meetUrl && (
                <a
                  href={item.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    background: "#0f766e",
                    textDecoration: "none",
                    color: "white",
                    borderRadius: "4px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "#115e59"}
                  onMouseOut={(e) => e.currentTarget.style.background = "#0f766e"}
                >
                  Join Google Meet
                </a>
              )}
              {item.calendarUrl && (
                <a
                  href={item.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    padding: "4px 8px",
                    fontSize: "0.75rem",
                    background: "rgba(255, 255, 255, 0.05)",
                    textDecoration: "none",
                    color: "#d1d5db",
                    borderRadius: "4px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                  onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                >
                  View Calendar
                </a>
              )}
            </div>

            <button
              onClick={() => handleDelete("meetings", item.id, item.title)}
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem", marginTop: "8px" }}
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
                <h4 className="item-title" style={{ maxWidth: "220px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {item.subject}
                </h4>
                <span className="item-subtitle">To: {item.to}</span>
              </div>
            </div>
            <div style={{ fontSize: "0.8rem", color: "#d1d5db", background: "rgba(0,0,0,0.1)", padding: "8px", borderRadius: "4px", whiteSpace: "pre-line" }}>
              {item.body}
            </div>
            {item.gmailMessageId && (
              <span style={{ fontSize: "0.7rem", color: "#10b981", marginTop: "4px", display: "block", fontWeight: 600 }}>
                Status: Sent (ID: {item.gmailMessageId})
              </span>
            )}
            <button
              onClick={() => handleDelete("emails", item.id, item.subject)}
              className="btn btn-danger"
              style={{ padding: "6px 10px", alignSelf: "flex-end", fontSize: "0.75rem", marginTop: "8px" }}
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
          <span>Project Workspace</span>
        </div>
        <p className="workspace-subtitle">statefull -  continue where u left.....</p>
      </div>

      {/* Navigation Tabs */}
      <div className="workspace-tabs">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const count = tab.data?.length || 0;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`workspace-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <IconComponent size={14} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span style={{
                  background: activeTab === tab.id ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
                  color: activeTab === tab.id ? "#3b82f6" : "#9ca3af",
                  fontSize: "0.7rem",
                  padding: "1px 5px",
                  borderRadius: "9999px",
                  fontWeight: 600
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Directory List */}
      <div className="workspace-content">
        <div className="section-container">
          <div className="section-header">
            <div className="section-title-wrap">
              <h3>{currentTab.label} Registry</h3>
            </div>
          </div>

          {currentTab.data.length === 0 ? (
            <div className="section-empty">
              <currentTab.icon size={28} />
              <p style={{ fontSize: "0.85rem" }}>
                No items recorded in this workspace category.
              </p>
              <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                Ask AI: "Register a new {currentTab.label.toLowerCase().slice(0, -1)}"
              </span>
            </div>
          ) : (
            currentTab.data.map((item) => renderItemCard(activeTab, item))
          )}
        </div>
      </div>

      {/* Premium Confirmation Dialog Modal Overlay */}
      {deleteConfirmItem && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#1E293B",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
            boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ background: "rgba(239, 68, 68, 0.15)", padding: "8px", borderRadius: "50%", color: "#EF4444" }}>
                <Trash2 size={20} />
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#F8FAFC" }}>Confirm Deletion</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#94A3B8", lineHeight: "1.5", marginBottom: "20px" }}>
              Are you sure you want to delete <strong>{deleteConfirmItem.itemTitle}</strong>? This action cannot be undone and will permanently remove the record from MongoDB.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="btn btn-secondary"
                style={{ padding: "8px 16px", borderRadius: "6px" }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await project.deleteWorkspaceItem(deleteConfirmItem.category, deleteConfirmItem.itemId);
                  } catch (err) {
                    alert("Failed to delete item: " + err.message);
                  } finally {
                    setDeleteConfirmItem(null);
                  }
                }}
                className="btn btn-primary"
                style={{ padding: "8px 16px", background: "#EF4444", borderRadius: "6px" }}
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspace;
