import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getAddressesByCustomer,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../api/customerAddressApi';
import CustomerAddressForm from '../Component/CustomerAddressForm';

const CustomerAddresses = () => {
  const { customerId } = useParams();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getAddressesByCustomer(customerId)
      .then(res => setAddresses(res.data.addresses))
      .finally(() => setLoading(false));
  }, [customerId, refresh]);

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (address) => {
    setEditData(address);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this address?')) {
      setLoading(true);
      await deleteAddress(id);
      setRefresh(r => !r);
    }
  };

  const handleSetDefault = async (id) => {
    setLoading(true);
    await setDefaultAddress(id);
    setRefresh(r => !r);
  };

  const handleFormSubmit = async (data) => {
    setLoading(true);
    if (editData) {
      await updateAddress(editData.id, data);
    } else {
      await createAddress({ ...data, customer_id: customerId });
    }
    setShowForm(false);
    setRefresh(r => !r);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Customer Addresses</h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/customers')}>Back to Customers</button>
          <button className="btn btn-primary" onClick={handleAdd}>Add Address</button>
        </div>
      </div>
      {showForm && (
        <div className="mb-4 bg-base-200 p-4 rounded">
          <CustomerAddressForm
            initialData={editData}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Pincode</th>
              <th>Default</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.map(a => (
              <tr key={a.id} className={a.is_default ? 'bg-green-100' : ''}>
                <td>{a.name}</td>
                <td>{a.phone}</td>
                <td>{a.address_line}</td>
                <td>{a.city}</td>
                <td>{a.state}</td>
                <td>{a.country}</td>
                <td>{a.pincode}</td>
                <td>{a.is_default ? 'Yes' : (
                  <button className="btn btn-xs btn-outline" onClick={() => handleSetDefault(a.id)}>Set Default</button>
                )}</td>
                <td className="flex gap-2">
                  <button className="btn btn-xs btn-warning" onClick={() => handleEdit(a)}>Edit</button>
                  <button className="btn btn-xs btn-error" onClick={() => handleDelete(a.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomerAddresses; 