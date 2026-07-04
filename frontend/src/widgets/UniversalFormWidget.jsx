import React, { useState } from "react";

const UniversalFormWidget = ({ widget, onSave, onCancel }) => {
  const { title, fields = [], buttons = [] } = widget;
  
  // Initialize form state using the prefilled values or blanks
  const [formData, setFormData] = useState(() => {
    const init = {};
    fields.forEach((f) => {
      init[f.name] = f.value !== undefined && f.value !== null ? f.value : "";
    });
    return init;
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) || "" : value
    }));
  };

  const handleSubmit = (e, buttonAction) => {
    e.preventDefault();
    onSave(formData, buttonAction);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <form onSubmit={(e) => handleSubmit(e, buttons[0]?.action)} className="widget-form">
        {fields.map((field) => {
          const { name, label, type, placeholder, required, options = [] } = field;
          
          return (
            <div key={name} className="form-group">
              <label className="form-label">{label}</label>
              
              {type === "select" ? (
                <select
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="form-input"
                  required={required}
                >
                  <option value="" disabled>Select option...</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : type === "textarea" ? (
                <textarea
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="form-input form-textarea"
                  placeholder={placeholder || ""}
                  required={required}
                />
              ) : (
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={placeholder || ""}
                  required={required}
                />
              )}
            </div>
          );
        })}

        <div className="widget-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
          )}
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              type="submit"
              onClick={(e) => {
                // Set the current action parameter on submit trigger
                e.preventDefault();
                handleSubmit(e, btn.action);
              }}
              className={`btn btn-primary ${btn.style === "danger" ? "btn-danger" : ""}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};

export default UniversalFormWidget;
