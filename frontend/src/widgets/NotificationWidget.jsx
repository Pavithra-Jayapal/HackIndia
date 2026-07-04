import React, { useState } from "react";

const NotificationWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    recipient: props?.recipient || "All Site Workers",
    title: props?.title || "",
    message: props?.message || "",
    severity: props?.severity || "Info"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      alert("Please fill in notification title and message");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">Recipient Group</label>
        <input
          type="text"
          name="recipient"
          value={formData.recipient}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. All Site Workers, Site Engineers"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Title / Subject</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Heavy Rain Warning - Safety Alert"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Broadcast Message</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="form-input form-textarea"
          placeholder="Write announcement description..."
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Severity Level</label>
        <select
          name="severity"
          value={formData.severity}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Info">Info / Notice</option>
          <option value="Warning">Warning</option>
          <option value="Alert">Alert (High Priority)</option>
        </select>
      </div>

      <div className="widget-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Save Broadcast
        </button>
      </div>
    </form>
  );
};

export default NotificationWidget;
