import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Video, 
  Copy, 
  ExternalLink, 
  HardHat, 
  DollarSign, 
  Package, 
  CheckSquare, 
  Mail, 
  Bell, 
  Clock, 
  Check, 
  User, 
  AlertTriangle,
  FileText,
  Trash2,
  Edit2
} from "lucide-react";

const SummaryCard = ({ widget, action = "createTodo", onEdit, onArchive }) => {
  if (!widget) return null;

  const { title, submittedData = {} } = widget;
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (link) => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Card wrapper subtle pop-in animation definition
  const cardVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 }
    }
  };

  // --- Specific Card Variant Dispatchers ---

  // 0. Quota / Rate Limit Warning Card
  if (title.toLowerCase().includes("quota") || title.toLowerCase().includes("exhausted") || title.toLowerCase().includes("error")) {
    return (
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="premium-card glass"
        style={{ borderLeft: "4px solid #EF4444" }} // Red danger border
      >
        <div className="card-header">
          <AlertTriangle size={18} className="text-danger" />
          <div className="header-meta">
            <h4 className="card-title">{title}</h4>
            <span className="card-subtitle">System Warning Alert</span>
          </div>
        </div>

        <div className="card-body">
          {submittedData.details && (
            <div className="card-section">
              <span className="section-label">Warning Details</span>
              <p className="section-text" style={{ color: "#FCA5A5" }}>{submittedData.details}</p>
            </div>
          )}
          {submittedData.resolution && (
            <div className="card-section">
              <span className="section-label">Suggested Resolution</span>
              <p className="email-body-preview" style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#FCA5A5" }}>{submittedData.resolution}</p>
            </div>
          )}
        </div>

        <div className="card-footer">
          <a 
            href="https://aistudio.google.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary btn-sm"
            style={{ color: "#EF4444", borderColor: "rgba(239, 68, 68, 0.3)", textDecoration: "none" }}
          >
            Open Google AI Studio
          </a>
          <div className="footer-controls">
            <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 1. Google Meeting Card
  if (action === "scheduleMeeting" || title.toLowerCase().includes("meeting")) {
    const meetUrl = submittedData.meetUrl || "";
    const calendarUrl = submittedData.calendarUrl || "";
    const rawAttendees = submittedData.attendees || [];
    const date = submittedData.date || "N/A";
    const timeVal = submittedData.time || "N/A";
    const agenda = submittedData.agenda || "N/A";

    // Defensively parse attendees list
    let attendeesList = [];
    if (Array.isArray(rawAttendees)) {
      attendeesList = rawAttendees;
    } else if (typeof rawAttendees === "string") {
      attendeesList = rawAttendees.split(",").map(s => s.trim()).filter(Boolean);
    }

    return (
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="premium-card glass"
        style={{ borderLeft: "4px solid #10B981" }} // Green success border
      >
        <div className="card-header">
          <Calendar size={18} className="text-success" />
          <div className="header-meta">
            <h4 className="card-title">{submittedData.title || "Project Meeting"}</h4>
            <span className="card-subtitle">Google Calendar Integration</span>
          </div>
        </div>

        <div className="card-body">
          <div className="meta-time-grid">
            <div className="meta-time-item">
              <Clock size={14} className="text-secondary" />
              <span>{date}</span>
            </div>
            <div className="meta-time-item">
              <Clock size={14} className="text-secondary" />
              <span>{timeVal}</span>
            </div>
          </div>

          <div className="card-section">
            <span className="section-label">Agenda</span>
            <p className="section-text">{agenda}</p>
          </div>

          {attendeesList.length > 0 && (
            <div className="card-section">
              <span className="section-label">Attendees</span>
              <div className="badge-container">
                {attendeesList.map((email, idx) => (
                  <span key={idx} className="badge badge-outline">
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="footer-links">
            {meetUrl && (
              <a 
                href={meetUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary btn-sm"
              >
                <Video size={14} /> Join Meet
              </a>
            )}
            {meetUrl && (
              <button 
                onClick={() => handleCopyLink(meetUrl)} 
                className="btn btn-secondary btn-sm"
              >
                <Copy size={12} /> {copied ? "Copied" : "Copy Meet"}
              </button>
            )}
            {calendarUrl && (
              <a 
                href={calendarUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary btn-sm"
                title="View Calendar Event"
              >
                <ExternalLink size={12} /> Calendar
              </a>
            )}
          </div>

          <div className="footer-controls">
            <button onClick={onEdit} className="btn-icon" title="Edit Meeting Details">
              <Edit2 size={13} />
            </button>
            <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. Email Preview Card
  if (action === "sendEmail" || title.toLowerCase().includes("email")) {
    const to = submittedData.to || "N/A";
    const subject = submittedData.subject || "(No Subject)";
    const body = submittedData.body || "";
    const messageId = submittedData.gmailMessageId || "";

    return (
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="premium-card glass"
        style={{ borderLeft: "4px solid #2563EB" }} // Blue primary border
      >
        <div className="card-header">
          <Mail size={18} className="text-primary" />
          <div className="header-meta">
            <h4 className="card-title">Gmail Dispatch Preview</h4>
            <span className="card-subtitle">Google Gmail Integration</span>
          </div>
        </div>

        <div className="card-body">
          <div className="card-section">
            <span className="section-label">Recipient</span>
            <span className="section-value text-glow">{to}</span>
          </div>

          <div className="card-section">
            <span className="section-label">Subject</span>
            <span className="section-value">{subject}</span>
          </div>

          <div className="card-section">
            <span className="section-label">Body Preview</span>
            <p className="email-body-preview">{body}</p>
          </div>

          {messageId && (
            <div className="status-badge-row">
              <span className="tag tag-success">
                <Check size={12} /> Message Dispatched
              </span>
              <span className="message-id-tag">ID: {messageId}</span>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div style={{ display: "flex", gap: "8px" }} />
          <div className="footer-controls">
            <button onClick={onEdit} className="btn-icon" title="Edit Email Content">
              <Edit2 size={13} />
            </button>
            <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 3. Capital Budget Card
  if (action === "createBudget" || title.toLowerCase().includes("budget")) {
    const project = submittedData.project || "N/A";
    const amount = Number(submittedData.amount || 0);
    const category = submittedData.category || "General";

    return (
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="premium-card glass"
        style={{ borderLeft: "4px solid #F59E0B" }} // Orange Warning border
      >
        <div className="card-header">
          <DollarSign size={18} className="text-warning" />
          <div className="header-meta">
            <h4 className="card-title">{project}</h4>
            <span className="card-subtitle">Budget Allocation</span>
          </div>
        </div>

        <div className="card-body">
          <div className="card-section">
            <span className="section-label">Allocated Capital</span>
            <span className="budget-amount-text">
              ₹{amount.toLocaleString()}
            </span>
          </div>

          <div className="card-section">
            <span className="section-label">Budget Category</span>
            <span className="badge badge-warning">{category}</span>
          </div>
        </div>

        <div className="card-footer">
          <div style={{ display: "flex", gap: "8px" }} />
          <div className="footer-controls">
            <button onClick={onEdit} className="btn-icon" title="Edit Budget">
              <Edit2 size={13} />
            </button>
            <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 4. Worker Card
  if (action === "createWorker" || title.toLowerCase().includes("worker")) {
    const name = submittedData.name || "N/A";
    const role = submittedData.role || submittedData.specialization || "N/A";
    const status = submittedData.status || "Active";
    
    // Safety check for salary to prevent NaN
    const rawSalary = submittedData.salary;
    const salaryVal = (rawSalary !== undefined && rawSalary !== null && rawSalary !== "") ? Number(rawSalary) : null;
    const salaryText = (salaryVal !== null && !isNaN(salaryVal)) ? `₹${salaryVal.toLocaleString()}` : "Not Provided";
    
    const phone = submittedData.phone ?? "Not Provided";
    const email = submittedData.email ?? "Not Provided";
    const contactDetails = submittedData.contactDetails ?? "Not Provided";

    return (
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="premium-card glass"
        style={{ borderLeft: "4px solid #8B5CF6" }} // Purple accent border
      >
        <div className="card-header">
          <HardHat size={18} style={{ color: "#a78bfa" }} />
          <div className="header-meta">
            <h4 className="card-title">{name}</h4>
            <span className="card-subtitle">{role}</span>
          </div>
        </div>

        <div className="card-body">
          <div className="card-section-grid">
            <div className="grid-cell">
              <span className="section-label">Status</span>
              <span className={`tag ${status === "Active" ? "tag-success" : "tag-danger"}`}>
                {status}
              </span>
            </div>
            
            {/* Render Salary if it is a part of the schema or has a value */}
            {("salary" in submittedData || submittedData.salary !== undefined) && (
              <div className="grid-cell">
                <span className="section-label">Monthly Salary</span>
                <span className="grid-value">{salaryText}</span>
              </div>
            )}

            <div className="grid-cell">
              <span className="section-label">Phone Number</span>
              <span className="grid-value">{phone}</span>
            </div>

            <div className="grid-cell">
              <span className="section-label">Email</span>
              <span className="grid-value">{email}</span>
            </div>

            {/* Render Contact Details if it is a part of the schema or has a value */}
            {("contactDetails" in submittedData || submittedData.contactDetails !== undefined) && (
              <div className="grid-cell" style={{ gridColumn: "span 2" }}>
                <span className="section-label">Contact Details</span>
                <span className="grid-value">{contactDetails}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-footer">
          <div style={{ display: "flex", gap: "8px" }} />
          <div className="footer-controls">
            <button onClick={onEdit} className="btn-icon" title="Edit Worker Details">
              <Edit2 size={13} />
            </button>
            <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 5. Material Inventory Card
  if (action === "createInventory" || title.toLowerCase().includes("inventory")) {
    const itemName = submittedData.itemName || "N/A";
    const quantity = Number(submittedData.quantity || 0);
    const unit = submittedData.unit || "pcs";
    const status = submittedData.status || "In Stock";

    const isLow = status.toLowerCase().includes("low") || quantity < 10;
    const isOut = status.toLowerCase().includes("out") || quantity === 0;

    return (
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="premium-card glass"
        style={{ borderLeft: isOut ? "4px solid #EF4444" : isLow ? "4px solid #F59E0B" : "4px solid #10B981" }}
      >
        <div className="card-header">
          <Package size={18} className={isOut ? "text-danger" : isLow ? "text-warning" : "text-success"} />
          <div className="header-meta">
            <h4 className="card-title">{itemName}</h4>
            <span className="card-subtitle">Inventory Audit Log</span>
          </div>
        </div>

        <div className="card-body">
          <div className="card-section">
            <span className="section-label">Current Stock Level</span>
            <span className="inventory-level-text">
              {quantity} <span style={{ fontSize: "1rem", color: "var(--text-secondary)" }}>{unit}</span>
            </span>
          </div>

          <div className="card-section">
            <span className="section-label">Availability Status</span>
            <span className={`tag ${isOut ? "tag-danger" : isLow ? "tag-warning" : "tag-success"}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="card-footer">
          <div style={{ display: "flex", gap: "8px" }} />
          <div className="footer-controls">
            <button onClick={onEdit} className="btn-icon" title="Edit Inventory">
              <Edit2 size={13} />
            </button>
            <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 6. Project Tasks Card
  if (action === "createTodo" || title.toLowerCase().includes("task") || title.toLowerCase().includes("todo")) {
    const task = submittedData.task || "N/A";
    const dueDate = submittedData.dueDate || "N/A";
    const assignedTo = submittedData.assignedTo || "Unassigned";
    const status = submittedData.status || "Pending";

    return (
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="premium-card glass"
        style={{ borderLeft: "4px solid #38BDF8" }} // Accent teal border
      >
        <div className="card-header">
          <CheckSquare size={18} style={{ color: "#38bdf8" }} />
          <div className="header-meta">
            <h4 className="card-title">{task}</h4>
            <span className="card-subtitle">Task Assignment</span>
          </div>
        </div>

        <div className="card-body">
          <div className="card-section">
            <span className="section-label">Assignee</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 500 }}>
              <User size={14} className="text-secondary" />
              <span>{assignedTo}</span>
            </div>
          </div>

          <div className="card-section-grid">
            <div className="grid-cell">
              <span className="section-label">Due Date</span>
              <span className="grid-value" style={{ fontSize: "0.8rem" }}>{dueDate}</span>
            </div>
            <div className="grid-cell">
              <span className="section-label">Status</span>
              <span className={`tag ${status === "Completed" ? "tag-success" : "tag-warning"}`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <div style={{ display: "flex", gap: "8px" }} />
          <div className="footer-controls">
            <button onClick={onEdit} className="btn-icon" title="Edit Task">
              <Edit2 size={13} />
            </button>
            <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default: Custom Clean Workspace Card
  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="premium-card glass"
    >
      <div className="card-header">
        <FileText size={18} className="text-secondary" />
        <div className="header-meta">
          <h4 className="card-title">{title}</h4>
          <span className="card-subtitle">Saved Workspace Resource</span>
        </div>
      </div>

      <div className="card-body">
        <div className="summary-details">
          {Object.entries(submittedData).map(([key, val]) => {
            if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "version" || key === "conversationId") return null;
            
            // Format labels
            const formattedLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            return (
              <div key={key} className="summary-row">
                <span className="summary-label">{formattedLabel}</span>
                <span className="summary-value" title={String(val)}>
                  {val !== undefined && val !== null ? String(val) : "N/A"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-footer">
        <div style={{ display: "flex", gap: "8px" }} />
        <div className="footer-controls">
          <button onClick={onEdit} className="btn-icon" title="Edit Details">
            <Edit2 size={13} />
          </button>
          <button onClick={onArchive} className="btn-icon danger-hover" title="Archive Card">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
