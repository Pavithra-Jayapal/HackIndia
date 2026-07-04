import React, { useState } from "react";

const EmailWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    to: props?.to || "all-workers@site.com",
    subject: props?.subject || "",
    body: props?.body || ""
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
    if (!formData.to.trim() || !formData.subject.trim() || !formData.body.trim()) {
      alert("Please fill in recipient, subject, and body");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">To (Recipients)</label>
        <input
          type="text"
          name="to"
          value={formData.to}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. all-workers@site.com, client@construction.com"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Subject</label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Safety Briefing for Concrete Slab Concreting"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email Content</label>
        <textarea
          name="body"
          value={formData.body}
          onChange={handleChange}
          className="form-input form-textarea"
          placeholder="Write email contents here..."
          required
        />
      </div>

      <div className="widget-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Save Draft Email
        </button>
      </div>
    </form>
  );
};

export default EmailWidget;
