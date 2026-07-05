import React, { useState } from "react";
import { useProject } from "../context/ProjectContext";
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react";

const Sidebar = () => {
  const {
    conversations,
    activeConversationId,
    createConversation,
    selectConversation,
    renameConversation,
    deleteConversation
  } = useProject();

  // Load collapse state from local storage or default to false (expanded)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem("sidebar_collapsed") === "true";
  });

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const toggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  // Group conversations by Today, Yesterday, and Previous
  const getGroupedConversations = () => {
    const groups = { Today: [], Yesterday: [], Previous: [] };
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    conversations.forEach(c => {
      const updatedTime = c.updatedAt * 1000;
      if (updatedTime >= startOfToday) {
        groups.Today.push(c);
      } else if (updatedTime >= startOfYesterday) {
        groups.Yesterday.push(c);
      } else {
        groups.Previous.push(c);
      }
    });

    return groups;
  };

  const handleStartEdit = (e, c) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveEdit = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      renameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, id, title) => {
    e.stopPropagation();
    deleteConversation(id);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const grouped = getGroupedConversations();

  return (
    <div className={`sidebar-panel ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        {!isCollapsed && (
          <div className="sidebar-brand">
            <Sparkles size={16} style={{ color: "#3b82f6" }} />
            <span>ArchitectAI</span>
          </div>
        )}
        <button onClick={toggleSidebar} className="collapse-toggle" title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New Chat Action */}
      <div className="sidebar-action-container">
        {isCollapsed ? (
          <button 
            onClick={createConversation} 
            className="new-chat-icon-btn" 
            title="New Chat"
          >
            <Plus size={18} />
          </button>
        ) : (
          <button onClick={createConversation} className="new-chat-btn">
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {/* Conversations Directory */}
      <div className="sidebar-content">
        {isCollapsed ? (
          <div className="collapsed-list">
            {conversations.map(c => (
              <button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={`collapsed-item ${activeConversationId === c.id ? "active" : ""}`}
                title={c.title}
              >
                <MessageSquare size={16} />
              </button>
            ))}
          </div>
        ) : (
          Object.entries(grouped).map(([groupName, list]) => {
            if (list.length === 0) return null;
            return (
              <div key={groupName} className="conversation-group">
                <h5 className="group-title">{groupName}</h5>
                <div className="group-list">
                  {list.map(c => {
                    const isActive = activeConversationId === c.id;
                    const isEditing = editingId === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => !isEditing && selectConversation(c.id)}
                        className={`conversation-item ${isActive ? "active" : ""}`}
                      >
                        <div className="conversation-item-main">
                          <MessageSquare size={14} className="chat-icon" />
                          
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveEdit(e, c.id);
                                if (e.key === "Escape") handleCancelEdit(e);
                              }}
                              className="edit-title-input"
                              autoFocus
                            />
                          ) : (
                            <div className="conversation-text-wrap">
                              <span className="conversation-title">{c.title}</span>
                              {c.lastMessage && (
                                <span className="conversation-last-msg">{c.lastMessage}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Hover Actions / Controls */}
                        {!isEditing ? (
                          <div className="conversation-actions">
                            <span className="conversation-time">{formatTime(c.updatedAt)}</span>
                            <div className="action-buttons">
                              <button 
                                onClick={(e) => handleStartEdit(e, c)} 
                                title="Rename Chat"
                                className="action-btn"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button 
                                onClick={(e) => handleDelete(e, c.id, c.title)} 
                                title="Delete Chat"
                                className="action-btn delete"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="conversation-edit-controls">
                            <button 
                              onClick={(e) => handleSaveEdit(e, c.id)} 
                              title="Save"
                              className="control-btn check"
                            >
                              <Check size={12} />
                            </button>
                            <button 
                              onClick={handleCancelEdit} 
                              title="Cancel"
                              className="control-btn cancel"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Sidebar;
