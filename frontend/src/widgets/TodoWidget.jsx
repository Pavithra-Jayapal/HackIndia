import React, { useState } from "react";

const TodoWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    task: props?.task || "",
    dueDate: props?.dueDate || "",
    assignedTo: props?.assignedTo || "Site Supervisor",
    status: props?.status || "Pending"
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
    if (!formData.task.trim() || !formData.dueDate.trim()) {
      alert("Please fill in Task description and Due Date");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">Task Description</label>
        <input
          type="text"
          name="task"
          value={formData.task}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Inspect Block A safety harness"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Assigned To</label>
        <input
          type="text"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Supervisor, Electrician Lead"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="widget-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Save Task
        </button>
      </div>
    </form>
  );
};

export default TodoWidget;
