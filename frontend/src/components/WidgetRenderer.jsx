import React from "react";
import { motion } from "framer-motion";
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

  // Spring animation settings
  const containerVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 350, damping: 25 }
    }
  };

  if (widget.status === "saved") {
    return (
      <SummaryCard
        widget={widget}
        action={primaryAction}
        onEdit={onEdit}
        onArchive={onArchive}
      />
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="widget-container"
    >
      <div className="widget-title">
        {IconComponent && <IconComponent size={18} style={{ color: "var(--accent-primary)" }} />}
        <span>{widget.title}</span>
      </div>
      <UniversalFormWidget
        widget={widget}
        onSave={onSave}
        onCancel={widget.dataId ? onCancelEdit : null}
      />
    </motion.div>
  );
};

export default WidgetRenderer;
