import React, { useState, useEffect } from 'react';

const CustomerAddressForm = ({ initialData = {}, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address_line: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    is_default: false
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        phone: initialData.phone || '',
        address_line: initialData.address_line || '',
        city: initialData.city || '',
        state: initialData.state || '',
        country: initialData.country || 'India',
        pincode: initialData.pincode || '',
        is_default: !!initialData.is_default
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium">Name</label>
        <input name="name" value={form.name} onChange={handleChange} required className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block font-medium">Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required className="input input-bordered w-full" />
      </div>
      <div>
        <label className="block font-medium">Address Line</label>
        <input name="address_line" value={form.address_line} onChange={handleChange} required className="input input-bordered w-full" />
      </div>
      <div className="flex gap-2">
        <div className="w-1/2">
          <label className="block font-medium">City</label>
          <input name="city" value={form.city} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div className="w-1/2">
          <label className="block font-medium">State</label>
          <input name="state" value={form.state} onChange={handleChange} className="input input-bordered w-full" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-1/2">
          <label className="block font-medium">Country</label>
          <input name="country" value={form.country} onChange={handleChange} className="input input-bordered w-full" />
        </div>
        <div className="w-1/2">
          <label className="block font-medium">Pincode</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} className="input input-bordered w-full" />
        </div>
      </div>
      <div>
        <label className="inline-flex items-center">
          <input type="checkbox" name="is_default" checked={form.is_default} onChange={handleChange} />
          <span className="ml-2">Set as default address</span>
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
};

export default CustomerAddressForm; 