import React from "react";
import { WidgetRegistry } from "../widgets/WidgetRegistry";
import SummaryCard from "./SummaryCard";

const WidgetRenderer = ({ 
  messageId, 
  widget, 
  onSave, 
  onEdit, 
  onArchive,
  onCancelEdit
}) => {
  if (!widget || !widget.type) return null;

  const registryItem = WidgetRegistry[widget.type];
  if (!registryItem) {
    console.warn(`Widget type "${widget.type}" is not registered in WidgetRegistry.`);
    return null;
  }

  const WidgetComponent = registryItem.component;

  if (widget.status === "saved") {
    return (
      <SummaryCard
        widgetType={widget.type}
        props={widget.props}
        onEdit={onEdit}
        onArchive={onArchive}
      />
    );
  }

  return (
    <div className="widget-container">
      <div className="widget-title">
        {registryItem.icon && <registryItem.icon size={18} style={{ color: "#3b82f6" }} />}
        <span>{registryItem.title}</span>
      </div>
      <WidgetComponent
        props={widget.props}
        onSave={onSave}
        onCancel={widget.dataId ? onCancelEdit : null}
      />
    </div>
  );
};

export default WidgetRenderer;
