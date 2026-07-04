import React, { useState } from "react";

const InventoryWidget = ({ props, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    id: props?.id || "",
    itemName: props?.itemName || "",
    quantity: props?.quantity || "",
    unit: props?.unit || "Bags",
    status: props?.status || "In Stock"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) || "" : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.itemName.trim() || !formData.quantity) {
      alert("Please fill in Material Item Name and Quantity");
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="widget-form">
      <div className="form-group">
        <label className="form-label">Material / Item Name</label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. Cement OPC 53 Grade"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Quantity</label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="form-input"
          placeholder="e.g. 500"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Unit of Measure</label>
        <select
          name="unit"
          value={formData.unit}
          onChange={handleChange}
          className="form-input"
        >
          <option value="Bags">Bags</option>
          <option value="Tons">Tons (Metric)</option>
          <option value="Nos">Nos (Pieces)</option>
          <option value="Meters">Meters</option>
          <option value="Brass">Brass (Volume)</option>
          <option value="Liters">Liters</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Availability Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="form-input"
        >
          <option value="In Stock">In Stock</option>
          <option value="Low">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
      </div>

      <div className="widget-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          Save Material
        </button>
      </div>
    </form>
  );
};

export default InventoryWidget;
