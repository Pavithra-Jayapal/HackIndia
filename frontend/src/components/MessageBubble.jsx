import React from "react";
import { useProject } from "../context/ProjectContext";
import { WidgetRegistry } from "../widgets/WidgetRegistry";
import WidgetRenderer from "./WidgetRenderer";

const MessageBubble = ({ message }) => {
  const { 
    saveWorkspaceItem, 
    updateChatMessageWidget, 
    archiveChatMessage 
  } = useProject();

  const isUser = message.role === "user";
  const { widget } = message;

  // 1. Handle Saving a Widget
  const handleSave = async (formData) => {
    if (!widget || !widget.type) return;
    
    const config = WidgetRegistry[widget.type];
    if (!config) return;

    try {
      // Save item to workspace collection (POST/PUT)
      const savedItem = await saveWorkspaceItem(config.category, formData);
      
      // Update chat message widget state to 'saved'
      await updateChatMessageWidget(message.id, {
        type: widget.type,
        props: savedItem, // Storing single source of truth
        status: "saved",
        dataId: savedItem.id
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
    if (window.confirm("Archive this card? It will remove it from the chat but won't delete the workspace item.")) {
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
        {/* Render text response if present */}
        {message.text && (
          <div className="ai-text">
            {message.text}
          </div>
        )}

        {/* Render interactive widget or summary card if present */}
        {widget && widget.type && (
          <WidgetRenderer
            messageId={message.id}
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
