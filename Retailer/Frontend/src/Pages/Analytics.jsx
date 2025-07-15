import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Layout from '../Component/Layout';
import { getOrderStatistics } from '../api/orderApi';
import { getCustomersWithOrders } from '../api/customerApi';
import { motion } from 'framer-motion';

const Analytics = () => {
  const [orderStats, setOrderStats] = useState({});
  const [customerStats, setCustomerStats] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [orderData, customersRes] = await Promise.all([
        getOrderStatistics(),
        getCustomersWithOrders({ page: 1, limit: 10000 })
      ]);
      let customersArr = [];
      if (customersRes && customersRes.data && customersRes.data.customers) {
        customersArr = customersRes.data.customers;
      } else if (customersRes.customers) {
        customersArr = customersRes.customers;
      }
      setCustomers(customersArr);
      // Calculate customer stats
      const total_customers = customersArr.length;
      const active_customers = customersArr.filter(c => !c.deleted_at).length;
      const inactive_customers = customersArr.filter(c => c.deleted_at).length;
      const customers_with_orders = customersArr.filter(c => c.orderCount > 0).length;
      const now = new Date();
      const new_customers_this_month = customersArr.filter(c => {
        if (!c.created_at) return false;
        const customerDate = new Date(c.created_at);
        return customerDate.getMonth() === now.getMonth() && 
               customerDate.getFullYear() === now.getFullYear();
      }).length;
      setOrderStats(orderData);
      setCustomerStats({
        total_customers,
        active_customers,
        inactive_customers,
        customers_with_orders,
        new_customers_this_month
      });
    } catch (error) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusPercentage = (statusCount, total) => {
    if (total === 0) return 0;
    return Math.round((statusCount / total) * 100);
  };

  const statusData = [
    { name: 'Pending', count: orderStats.pending_orders || 0, color: 'bg-yellow-500' },
    { name: 'Confirmed', count: orderStats.confirmed_orders || 0, color: 'bg-blue-500' },
    { name: 'Processing', count: orderStats.processing_orders || 0, color: 'bg-purple-500' },
    { name: 'Shipped', count: orderStats.shipped_orders || 0, color: 'bg-indigo-500' },
    { name: 'Delivered', count: orderStats.delivered_orders || 0, color: 'bg-green-500' },
    { name: 'Cancelled', count: orderStats.cancelled_orders || 0, color: 'bg-red-500' }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your business performance and insights</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.15 } }
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0 }}
                className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-50 rounded-lg shadow-lg p-6 border border-blue-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-500 rounded-lg shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-900">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-900">{orderStats.total_orders || 0}</p>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-900">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-900">{formatCurrency(orderStats.total_revenue || 0)}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-purple-100 via-purple-200 to-purple-50 rounded-lg shadow-lg p-6 border border-purple-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500 rounded-lg shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-900">Avg Order Value</p>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(orderStats.avg_order_value || 0)}</p>
                  </div>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-br from-indigo-100 via-indigo-200 to-indigo-50 rounded-lg shadow-lg p-6 border border-indigo-200"
              >
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-500 rounded-lg shadow">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-indigo-900">Total Customers</p>
                    <p className="text-2xl font-bold text-indigo-900">{customerStats.total_customers || 0}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Order Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status Distribution</h3>
                <div className="space-y-4">
                  {statusData.map((status) => (
                    <div key={status.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${status.color} mr-3`}></div>
                        <span className="text-sm font-medium text-gray-700">{status.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{status.count}</span>
                        <span className="text-sm text-gray-500">
                          ({getStatusPercentage(status.count, orderStats.total_orders || 0)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">New Orders</p>
                        <p className="text-xs text-gray-500">Pending orders: {orderStats.pending_orders || 0}</p>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">Action Required</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Revenue</p>
                        <p className="text-xs text-gray-500">This month: {formatCurrency(orderStats.total_revenue || 0)}</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Growing</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Customers</p>
                        <p className="text-xs text-gray-500">New this month: {customerStats.new_customers_this_month || 0}</p>
                      </div>
                    </div>
                    <span className="text-sm text-purple-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {orderStats.total_orders ? Math.round((orderStats.delivered_orders / orderStats.total_orders) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600">Order Completion Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {customerStats.total_customers ? Math.round((orderStats.total_orders / customerStats.total_customers) * 100) / 100 : 0}
                  </div>
                  <p className="text-sm text-gray-600">Orders per Customer</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {orderStats.avg_order_value ? Math.round(orderStats.avg_order_value) : 0}
                  </div>
                  <p className="text-sm text-gray-600">Average Order Value (₹)</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Analytics; 