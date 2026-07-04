import React from "react";
import { WidgetRegistry } from "../widgets/WidgetRegistry";
import { CheckCircle } from "lucide-react";

const SummaryCard = ({ widgetType, props, onEdit, onArchive }) => {
  const config = WidgetRegistry[widgetType];
  
  if (!config) {
    return (
      <div className="summary-card">
        <div className="summary-header">
          <CheckCircle size={16} />
          <span>Widget Saved</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
          Item was saved successfully to workspace.
        </p>
      </div>
    );
  }

  return (
    <div className="summary-card">
      <div className="summary-header">
        <CheckCircle size={16} />
        <span>{config.title.replace("Add ", "").replace("Create ", "").replace("Schedule ", "").replace("Update ", "")} Created</span>
      </div>

      <div className="summary-details">
        {config.summaryFields.map((field) => {
          const rawValue = props[field.key];
          const displayValue = field.format ? field.format(rawValue, props) : rawValue;
          
          return (
            <div key={field.key} className="summary-row">
              <span className="summary-label">{field.label}</span>
              <span className="summary-value" title={rawValue}>
                {displayValue !== undefined && displayValue !== null ? String(displayValue) : "N/A"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="summary-actions">
        <button onClick={onEdit} className="summary-btn">
          Edit
        </button>
        <button onClick={onArchive} className="summary-btn danger-text">
          Archive
        </button>
      </div>
    </div>
  );
};

export default SummaryCard;
