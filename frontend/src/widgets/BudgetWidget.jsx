import React, { useState } from "react";

const BudgetWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    project: props?.project || "",
    amount: props?.amount || "",
    category: props?.category || "Civil"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) || "" : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.project.trim() || !formData.amount) {
      alert("Please fill in Project Name and Amount");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">Project / Work Phase</label>
        <input
          type="text"
          name="project"
          value={formData.project}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Foundation, Concrete Slab, Brickwork"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Allocated Amount (₹)</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. 1500000"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Expense Category</label>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Civil">Civil / Structural</option>
          <option value="Electrical">Electrical</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Material">Material Procurement</option>
          <option value="Labor">Labor Cost</option>
          <option value="Equipment">Equipment Rental</option>
          <option value="Finishing">Finishing / Painting</option>
        </select>
      </div>

      <div className="widget-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Save Budget
        </button>
      </div>
    </form>
  );
};

export default BudgetWidget;
