import React, { useState, useEffect } from 'react';

const initialState = { name: '', email: '', phone: '', password: '' };

function validate(values, isEdit) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  if (!isEdit) {
    if (!values.email.trim()) errors.email = 'Email is required';
    else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(values.email)) errors.email = 'Invalid email';
  }
  if (!values.phone.trim()) errors.phone = 'Phone is required';
  else if (!/^\d{10}$/.test(values.phone)) errors.phone = 'Phone must be 10 digits';
  if (!isEdit) {
    if (!values.password) errors.password = 'Password is required';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(values.password)) errors.password = 'Password must be 8+ chars, include uppercase, lowercase, number, special char';
  }
  return errors;
}

const CustomerForm = ({ customer, onSave, onCancel, loading }) => {
  const isEdit = !!customer;
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && customer) {
      setValues({ ...customer, password: '' });
    } else {
      setValues(initialState);
    }
    setErrors({});
  }, [customer, isEdit]);

  const handleChange = e => {
    setValues(v => ({ ...v, [e.target.name]: e.target.value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate(values, isEdit);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      const data = { ...values };
      if (isEdit) delete data.email;
      if (isEdit) delete data.password;
      onSave(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          name="name"
          type="text"
          className={`w-full border rounded px-3 py-2 ${errors.name ? 'border-red-500' : ''}`}
          value={values.name}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          name="email"
          type="email"
          className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}
          value={values.email}
          onChange={handleChange}
          disabled={isEdit || loading}
        />
        {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          name="phone"
          type="tel"
          className={`w-full border rounded px-3 py-2 ${errors.phone ? 'border-red-500' : ''}`}
          value={values.phone}
          onChange={handleChange}
          disabled={loading}
        />
        {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
      </div>
      {!isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            className={`w-full border rounded px-3 py-2 ${errors.password ? 'border-red-500' : ''}`}
            value={values.password}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
        </div>
      )}
      <div className="flex justify-end gap-2 mt-4">
        <button type="button" className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={onCancel} disabled={loading}>Cancel</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>{isEdit ? 'Update' : 'Add'} Customer</button>
      </div>
    </form>
  );
};

export default CustomerForm; 