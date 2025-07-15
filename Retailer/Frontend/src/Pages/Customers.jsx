import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getCustomersWithOrders,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById
} from '../api/customerApi';
import CustomerForm from '../Component/CustomerForm';
import CustomerDetails from '../Component/CustomerDetails';
import toast from 'react-hot-toast';
import Layout from '../Component/Layout';
import { motion } from 'framer-motion';

const PAGE_SIZE = 10;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Move fetchCustomers function above useEffects
  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
    const res = await getCustomersWithOrders({ page, limit: PAGE_SIZE, search });
    console.log('API Response:', res); // Debug log
    // Robust mapping for different response structures
    if (res && res.customers) {
      setCustomers(res.customers);
    } else if (res.data && res.data.customers) {
      setCustomers(res.data.customers);
    } else {
      setCustomers([]);
      setError(res.message || 'Failed to fetch customers');
    }
    setLoading(false);
  };

  // Sync search param from URL to search state on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearch(searchParam);
      setPage(1);
    }
    // eslint-disable-next-line
  }, [location.search]);

  // Fetch customers whenever page or search changes
  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, [page, search]);

  // Add/Edit customer handler
  const handleSave = async (data) => {
    setLoading(true);
    let res;
    if (editCustomer) {
      res = await updateCustomer(editCustomer.id, data);
    } else {
      res = await addCustomer(data);
    }
    if (res.success) {
      toast.success(editCustomer ? 'Customer updated!' : 'Customer added!');
      setShowForm(false);
      setEditCustomer(null);
      fetchCustomers();
    } else {
      toast.error(res.message || 'Operation failed');
    }
    setLoading(false);
  };

  // Delete customer handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    setLoading(true);
    const res = await deleteCustomer(id);
    if (res.success) {
      toast.success('Customer deleted!');
      fetchCustomers();
    } else {
      toast.error(res.message || 'Delete failed');
    }
    setLoading(false);
  };

  // View customer handler
  const handleView = async (id) => {
    setLoading(true);
    const res = await getCustomerById(id);
    if (res.success) {
      setViewCustomer(res.data);
    } else {
      toast.error(res.message || 'Failed to fetch details');
    }
    setLoading(false);
  };

  // Navigate to orders page with customer filter
  const handleViewOrders = (customerEmail) => {
    navigate(`/orders?customer=${encodeURIComponent(customerEmail)}`);
  };

  // Stats calculation
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => !c.deleted_at).length;
  const inactiveCustomers = customers.filter(c => c.deleted_at).length;
  const customersWithOrders = customers.filter(c => c.orderCount > 0).length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0 }}
            className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 rounded-lg shadow-lg p-6 border border-blue-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-900">Total Customers</p>
                <p className="text-2xl font-bold text-blue-900">{totalCustomers}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-green-100 via-green-200 to-green-50 rounded-lg shadow-lg p-6 border border-green-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-900">Active Customers</p>
                <p className="text-2xl font-bold text-green-900">{activeCustomers}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gradient-to-br from-gray-100 via-gray-200 to-gray-50 rounded-lg shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-gray-500 rounded-lg shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3a3 3 0 01-3 3H9a3 3 0 01-3-3V9" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Inactive Customers</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveCustomers}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-purple-100 via-purple-200 to-purple-50 rounded-lg shadow-lg p-6 border border-purple-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-900">Customers with Orders</p>
                <p className="text-2xl font-bold text-purple-900">{customersWithOrders}</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            onClick={() => { setShowForm(true); setEditCustomer(null); }}
          >
            + Add Customer
          </button>
        </div>
        <div className="mb-4 flex gap-2 items-center">
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            className="border rounded px-3 py-2 w-full max-w-xs"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="ml-2 px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              title="Clear search"
            >
              &#10005;
            </button>
          )}
        </div>
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-400 bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Orders</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Last Order Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-400">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="text-center text-red-500 py-8">{error}</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-8">No customers found.</td></tr>
              ) : customers.map(cust => (
                <tr key={cust.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{cust.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cust.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{cust.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewOrders(cust.email)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      title={`View orders for ${cust.name}`}
                    >
                      Orders ({cust.orderCount || 0})
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {cust.lastOrderDate ?
                      new Date(cust.lastOrderDate).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      }).replace(',', '') :
                      '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${!cust.deleted_at ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                      {!cust.deleted_at ? 'available' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200" onClick={() => handleView(cust.id)}>View</button>
                      <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200" onClick={() => { setEditCustomer(cust); setShowForm(true); }}>Edit</button>
                      <button className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200" onClick={() => handleDelete(cust.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >Next</button>
        </div>
      </div>
      {/* Add/Edit Customer Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
              <button onClick={() => { setShowForm(false); setEditCustomer(null); }} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <CustomerForm
              customer={editCustomer}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditCustomer(null); }}
              loading={loading}
            />
          </div>
        </div>
      )}
      {/* View Customer Modal */}
      {viewCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] max-w-md">
            <CustomerDetails customer={viewCustomer} onClose={() => setViewCustomer(null)} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Customers; 
