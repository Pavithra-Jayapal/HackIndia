import React, { useState } from "react";

const MeetingWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    title: props?.title || "",
    date: props?.date || "",
    time: props?.time || "",
    agenda: props?.agenda || ""
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
    if (!formData.title.trim() || !formData.date.trim() || !formData.time.trim()) {
      alert("Please fill in Meeting Title, Date, and Time");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">Meeting Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Daily Safety Toolbox Sync"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Time</label>
        <input
          type="time"
          name="time"
          value={formData.time}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Agenda</label>
        <textarea
          name="agenda"
          value={formData.agenda}
          onChange={handleChange}
          className="form-input form-textarea"
          placeholder="Write agenda topics..."
        />
      </div>

      <div className="widget-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Save Meeting
        </button>
      </div>
    </form>
  );
};

export default MeetingWidget;
