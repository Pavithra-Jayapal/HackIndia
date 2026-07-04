import React from "react";
import { getActionConfig } from "../widgets/WidgetRegistry";
import UniversalFormWidget from "../widgets/UniversalFormWidget";
import SummaryCard from "./SummaryCard";

const WidgetRenderer = ({ 
  widget, 
  onSave, 
  onEdit, 
  onArchive,
  onCancelEdit
}) => {
  if (!widget) return null;

  const primaryAction = widget.buttons?.[0]?.action || "createTodo";
  const config = getActionConfig(primaryAction);
  const IconComponent = config.icon;

  if (widget.status === "saved") {
    return (
      <SummaryCard
        widget={widget}
        onEdit={onEdit}
        onArchive={onArchive}
      />
    );
  }

  return (
    <div className="widget-container">
      <div className="widget-title">
        {IconComponent && <IconComponent size={18} style={{ color: "#3b82f6" }} />}
        <span>{widget.title}</span>
      </div>
      <UniversalFormWidget
        widget={widget}
        onSave={onSave}
        onCancel={widget.dataId ? onCancelEdit : null}
      />
    </div>
  );
};

export default WidgetRenderer;
