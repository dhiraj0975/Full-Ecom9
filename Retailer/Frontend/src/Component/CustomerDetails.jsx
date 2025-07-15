import React, { useEffect, useState } from 'react';
import { getCustomerAnalytics } from '../api/analyticsApi';
import { getCustomerOrders } from '../api/orderApi';

const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';
const formatCurrency = (amt) => amt != null ? `₹${Number(amt).toLocaleString('en-IN')}` : '-';

const CustomerDetails = ({ customer, onClose }) => {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!customer) return;
    setLoading(true);
    setError('');
    Promise.all([
      getCustomerAnalytics(customer.id),
      getCustomerOrders(customer.id)
    ]).then(([a, o]) => {
      if (a.success) setAnalytics(a.data); else setError(a.message || 'Failed to load analytics');
      if (o.success) setOrders(o.data); else setError(o.message || 'Failed to load orders');
      setLoading(false);
    });
  }, [customer]);

  if (!customer) return null;

  return (
    <div className="min-w-[320px] max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Customer Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>
      <div className="mb-4">
        <div className="font-semibold text-lg text-blue-900">{customer.name}</div>
        <div className="text-gray-700">{customer.email}</div>
        <div className="text-gray-700">{customer.phone}</div>
        <div className="text-gray-500 text-sm">Joined: {formatDate(customer.created_at)}</div>
      </div>
      {loading ? (
        <div className="text-center text-gray-400 py-6">Loading analytics & orders...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-6">{error}</div>
      ) : (
        <>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="font-semibold mb-2 text-blue-800">Analytics</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Total Orders:</span> <span className="font-bold">{analytics?.total_orders || 0}</span></div>
              <div><span className="text-gray-500">Total Spent:</span> <span className="font-bold">{formatCurrency(analytics?.total_spent)}</span></div>
              <div><span className="text-gray-500">Avg Order Value:</span> <span className="font-bold">{formatCurrency(analytics?.avg_order_value)}</span></div>
              <div><span className="text-gray-500">Last Order:</span> <span className="font-bold">{formatDate(analytics?.last_order_date)}</span></div>
              <div><span className="text-gray-500">First Order:</span> <span className="font-bold">{formatDate(analytics?.first_order_date)}</span></div>
            </div>
          </div>
          <div>
            <div className="font-semibold mb-2 text-blue-800">Recent Orders</div>
            {orders.length === 0 ? (
              <div className="text-gray-400 text-sm">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-2 py-1 text-left">Order ID</th>
                      <th className="px-2 py-1 text-left">Amount</th>
                      <th className="px-2 py-1 text-left">Status</th>
                      <th className="px-2 py-1 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id} className="border-t">
                        <td className="px-2 py-1">#{order.id}</td>
                        <td className="px-2 py-1">{formatCurrency(order.total_amount)}</td>
                        <td className="px-2 py-1">{order.order_status}</td>
                        <td className="px-2 py-1">{formatDate(order.placed_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomerDetails; 