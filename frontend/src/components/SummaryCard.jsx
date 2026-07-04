import React from "react";
import { CheckCircle } from "lucide-react";

const SummaryCard = ({ widget, onEdit, onArchive }) => {
  if (!widget) return null;

  const { title, fields = [], submittedData = {} } = widget;

  return (
    <div className="summary-card">
      <div className="summary-header">
        <CheckCircle size={16} />
        <span>{title} Saved</span>
      </div>

      <div className="summary-details">
        {fields.map((field) => {
          const val = submittedData[field.name];
          let displayValue = val;
          
          // Format numeric amounts / salaries automatically
          if (
            field.type === "number" &&
            (field.name.includes("amount") || 
             field.name.includes("salary") || 
             field.name.includes("quantity"))
          ) {
            if (field.name.includes("quantity")) {
              displayValue = `${val} ${submittedData.unit || ""}`;
            } else {
              displayValue = `₹${Number(val).toLocaleString()}`;
            }
          }

          return (
            <div key={field.name} className="summary-row">
              <span className="summary-label">{field.label}</span>
              <span className="summary-value" title={val}>
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
