import React, { useState, useRef, useEffect } from "react";
import { useProject } from "../context/ProjectContext";
import MessageBubble from "./MessageBubble";
import { Send, Sparkles, Trash2, Key } from "lucide-react";

const Chat = () => {
  const { 
    chatHistory, 
    isChatLoading, 
    sendChatMessage, 
    clearChatHistory,
    googleConnected,
    connectGoogle
  } = useProject();
  const [input, setInput] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isChatLoading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    sendChatMessage(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleClear = () => {
    setShowClearConfirm(true);
  };

  return (
    <div className="chat-panel">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <Sparkles size={18} style={{ color: "#3b82f6" }} />
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>AI Project Assistant</h3>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", display: "flex", alignItems: "center", gap: "4px" }}>
              <span className="chat-status-dot" style={{ backgroundColor: googleConnected ? "#10b981" : "#f59e0b" }}></span> 
              Online - {googleConnected ? "Google Connected" : "Gemini 2.5 Flash"}
            </span>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <button 
            onClick={handleClear} 
            title="Clear Chat History"
            style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer" }}
            onMouseOver={(e) => e.currentTarget.style.color = "#ef4444"}
            onMouseOut={(e) => e.currentTarget.style.color = "#6b7280"}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Google Authentication Warning Notice Banner */}
      {!googleConnected && (
        <div style={{
          background: "rgba(245, 158, 11, 0.08)",
          borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.8rem",
          color: "#fde047"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Key size={14} style={{ color: "#fbbf24" }} />
            <span>Google API actions are disabled. Connect account to dispatch emails and meetings.</span>
          </div>
          <button 
            onClick={connectGoogle}
            className="btn btn-primary"
            style={{ 
              padding: "4px 10px", 
              fontSize: "0.75rem", 
              background: "#d97706",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              borderRadius: "4px",
              fontWeight: 600
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#b45309"}
            onMouseOut={(e) => e.currentTarget.style.background = "#d97706"}
          >
            Connect Google
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="chat-messages">
        {chatHistory.length === 0 ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#6b7280",
            textAlign: "center",
            padding: "20px",
            gap: "12px"
          }}>
            <Sparkles size={32} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: "0.9rem", maxWidth: "340px", lineHeight: "1.6" }}>
              Ask me naturally to manage project details:
              <br />
              <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                "Allocate 15 lakh for foundation"<br />
                "Schedule a review meeting tomorrow with developer@gmail.com"<br />
                "Send an email to contractor@gmail.com detailing updates"<br />
                "Create a safety checklist"
              </span>
            </p>
          </div>
        ) : (
          chatHistory.map((msg, index) => (
            <MessageBubble key={msg.id || index} message={msg} />
          ))
        )}

        {/* AI Typing Indicator */}
        {isChatLoading && (
          <div className="message-row model">
            <div className="message-bubble" style={{ maxWidth: "200px" }}>
              <div className="loading-indicator">
                <div className="spinner"></div>
                <span>AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-wrapper">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message to create or edit project workspace items..."
            className="chat-input"
            rows={1}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!input.trim() || isChatLoading}
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {/* Premium Clear Chat Confirmation Dialog Modal Overlay */}
      {showClearConfirm && (
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
              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#F8FAFC" }}>Clear Chat History</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#94A3B8", lineHeight: "1.5", marginBottom: "20px" }}>
              Are you sure you want to clear the conversation history? This will permanently delete all chat messages in this session from MongoDB.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button 
                onClick={() => setShowClearConfirm(false)} 
                className="btn btn-secondary"
                style={{ padding: "8px 16px", borderRadius: "6px" }}
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    await clearChatHistory();
                  } catch (err) {
                    console.error("Failed to clear chat: ", err);
                  } finally {
                    setShowClearConfirm(false);
                  }
                }}
                className="btn btn-primary"
                style={{ padding: "8px 16px", background: "#EF4444", borderRadius: "6px" }}
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
