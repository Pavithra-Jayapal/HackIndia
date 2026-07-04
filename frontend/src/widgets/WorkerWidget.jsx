import React, { useState, useEffect } from "react";

const WorkerWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    name: props?.name || "",
    role: props?.role || "Carpenter",
    phone: props?.phone || "",
    salary: props?.salary || "",
    status: props?.status || "Active"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "salary" ? Number(value) || "" : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert("Please fill in Name and Phone Number");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Rohan Sharma"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Role</label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Project Manager">Project Manager</option>
          <option value="Lead Engineer">Lead Engineer</option>
          <option value="Supervisor">Supervisor</option>
          <option value="Carpenter">Carpenter</option>
          <option value="Electrician">Electrician</option>
          <option value="Plumber">Plumber</option>
          <option value="Mason">Mason</option>
          <option value="Laborer">Laborer</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
          placeholder="10-digit mobile number"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Salary (Monthly ₹)</label>
        <input
          type="number"
          name="salary"
          value={formData.salary}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. 25000"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Work Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Terminated">Terminated</option>
        </select>
      </div>

      <div className="widget-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Save Worker
        </button>
      </div>
    </form>
  );
};

export default WorkerWidget;
