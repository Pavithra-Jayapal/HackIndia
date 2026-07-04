import React from "react";
import { useProject } from "../context/ProjectContext";
import { getActionConfig } from "../widgets/WidgetRegistry";
import WidgetRenderer from "./WidgetRenderer";

const MessageBubble = ({ message }) => {
  const { 
    saveWorkspaceItem, 
    updateChatMessageWidget, 
    archiveChatMessage 
  } = useProject();

  const isUser = message.role === "user";
  const { widget } = message;

  // 1. Handle Saving dynamic form widget
  const handleSave = async (formData, buttonAction) => {
    if (!widget) return;
    
    const config = getActionConfig(buttonAction);
    const category = config.category;

    try {
      // If we are editing, append the existing ID to perform a PUT update
      const payload = { ...formData };
      if (widget.dataId) {
        payload.id = widget.dataId;
      }
      
      // Save item to MongoDB workspace collections
      const savedItem = await saveWorkspaceItem(category, payload);
      
      // Update chat message widget state to 'saved'
      await updateChatMessageWidget(message.id, {
        ...widget,
        status: "saved",
        dataId: savedItem.id,
        submittedData: savedItem // Single Source of Truth
      });
    } catch (err) {
      alert("Error saving item: " + err.message);
    }
  };

  // 2. Handle Re-opening Widget Form for Edit
  const handleEdit = async () => {
    if (!widget) return;
    await updateChatMessageWidget(message.id, {
      ...widget,
      status: "active"
    });
  };

  // 3. Handle Archiving Message Card (UI only)
  const handleArchive = async () => {
    if (window.confirm("Archive this card? It will remove it from the chat feed, but won't delete the persistent database record.")) {
      await archiveChatMessage(message.id);
    }
  };

  // 4. Handle Cancel Editing
  const handleCancelEdit = async () => {
    if (!widget) return;
    await updateChatMessageWidget(message.id, {
      ...widget,
      status: "saved"
    });
  };

  return (
    <div className={`message-row ${isUser ? "user" : "model"}`}>
      <div className="message-bubble">
        {/* Render conversational text response if present */}
        {message.text && (
          <div className="ai-text">
            {message.text}
          </div>
        )}

        {/* Render dynamic form widget or summary card if present */}
        {widget && widget.type === "form" && (
          <WidgetRenderer
            widget={widget}
            onSave={handleSave}
            onEdit={handleEdit}
            onArchive={handleArchive}
            onCancelEdit={handleCancelEdit}
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
