import React, { useState } from "react";

const ScheduleWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    activity: props?.activity || "",
    startDate: props?.startDate || "",
    endDate: props?.endDate || "",
    assignedTeam: props?.assignedTeam || ""
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
    if (!formData.activity.trim() || !formData.startDate.trim() || !formData.endDate.trim()) {
      alert("Please fill in Activity, Start Date, and End Date");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">Activity Name</label>
        <input
          type="text"
          name="activity"
          value={formData.activity}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Concrete slab casting"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Start Date</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">End Date</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Assigned Team / Subcontractor</label>
        <input
          type="text"
          name="assignedTeam"
          value={formData.assignedTeam}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Civil Team B, Plumbing Lead"
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
          Save Schedule
        </button>
      </div>
    </form>
  );
};

export default ScheduleWidget;
