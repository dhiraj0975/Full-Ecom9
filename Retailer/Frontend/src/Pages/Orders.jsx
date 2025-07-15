import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Layout from '../Component/Layout';
import { getOrders, updateOrderStatus, getOrderStatistics, searchOrders, getCustomerOrders } from '../api/orderApi';
import { getOrderById } from '../api/orderApi';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAddressById } from '../api/customerAddressApi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const dropdownRef = useRef(null);
  const [searchField, setSearchField] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filteredCustomer, setFilteredCustomer] = useState(null);
  const [addressMap, setAddressMap] = useState({});

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  // Check for customer filter in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const customerParam = params.get('customer');
    if (customerParam) {
      setFilteredCustomer(customerParam);
      setSearchTerm(''); // Don't set searchTerm, just filter by customer
      setSearchField('all');
    } else {
      setFilteredCustomer(null);
    }
  }, [location.search]);

  // Load orders and statistics
  useEffect(() => {
    loadOrders();
    loadStatistics();
  }, [selectedStatus, filteredCustomer]);

  useEffect(() => {
    console.log('filteredCustomer:', filteredCustomer);
    console.log('orders:', orders);
  }, [filteredCustomer, orders]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSelectedOrder(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      let data = await getOrders(selectedStatus || null);
      if (filteredCustomer) {
        data = data.filter(order =>
          order.customer_email && order.customer_email.toLowerCase() === filteredCustomer.toLowerCase()
        );
      }
      setOrders(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await getOrderStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      loadOrders();
      loadStatistics();
    } catch (error) {
      toast.error(error.message || 'Failed to update order status');
    }
  };

  const handleSearch = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!searchTerm.trim() && searchField !== 'status') {
      loadOrders();
      return;
    }
    setLoading(true);
    try {
      let filtered = orders;
      const term = searchTerm.toLowerCase();
      if (searchField === 'all') {
        filtered = orders.filter(order =>
          order.id.toString().includes(term) ||
          (order.customer_name && order.customer_name.toLowerCase().includes(term)) ||
          (order.customer_email && order.customer_email.toLowerCase().includes(term)) ||
          (order.total_amount && order.total_amount.toString().includes(term)) ||
          (order.order_status && order.order_status.toLowerCase().includes(term)) ||
          (order.placed_at && new Date(order.placed_at).toLocaleDateString('en-IN').toLowerCase().includes(term)) ||
          (order.payment_method && order.payment_method.toLowerCase().includes(term))
        );
      } else if (searchField === 'id') {
        filtered = orders.filter(order => order.id.toString().includes(term));
      } else if (searchField === 'customer') {
        filtered = orders.filter(order => order.customer_name && order.customer_name.toLowerCase().includes(term));
      } else if (searchField === 'email') {
        filtered = orders.filter(order => order.customer_email && order.customer_email.toLowerCase().includes(term));
      } else if (searchField === 'amount') {
        filtered = orders.filter(order => order.total_amount && order.total_amount.toString().includes(term));
      } else if (searchField === 'status') {
        filtered = orders.filter(order => !searchTerm || order.order_status === searchTerm);
      } else if (searchField === 'date') {
        filtered = orders.filter(order => order.placed_at && new Date(order.placed_at).toLocaleDateString('en-IN').toLowerCase().includes(term));
      } else if (searchField === 'payment_method') {
        filtered = orders.filter(order => order.payment_method && order.payment_method.toLowerCase().includes(term));
      }
      setOrders(filtered);
    } catch (error) {
      toast.error(error.message || 'Failed to search orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const data = await getOrderById(orderId);
      setSelectedOrder(data);
      setShowOrderModal(true);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch order details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      upi: 'bg-green-100 text-green-800 border-green-200',
      card: 'bg-blue-100 text-blue-800 border-blue-200',
      cod: 'bg-orange-100 text-orange-800 border-orange-200',
      cash: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[method?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };
    
  // Calculate total items for filtered orders
  const totalItems = orders.reduce((sum, order) => {
    if (order.items && order.items.length > 0) {
      return sum + order.items.reduce((s, item) => s + (item.quantity || 0), 0);
    }
    return sum;
  }, 0);

  const fetchAddress = async (addressId) => {
    if (!addressId) return null;
    if (addressMap[addressId]) return addressMap[addressId];
    try {
      const res = await getAddressById(addressId);
      if (res && res.data) {
        setAddressMap((prev) => ({ ...prev, [addressId]: res.data }));
        return res.data;
      }
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (expandedOrderId) {
      const order = orders.find(o => o.id === expandedOrderId);
      if (order && order.address_id) {
        console.log('Order address_id:', order.address_id);
        console.log('addressMap:', addressMap);
        fetchAddress(order.address_id);
      }
    }
    // eslint-disable-next-line
  }, [expandedOrderId]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600">Manage and track all your orders</p>
              {filteredCustomer && (
                <div className="mb-2 text-lg font-semibold text-blue-700">
                  Total Orders: {orders.length}
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row md:items-end gap-4 w-full md:w-auto">
              <div className="flex-1 min-w-[220px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Orders</label>
                <div className="flex items-center bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 focus-within:ring-2 focus-within:ring-blue-400">
                  <select
                    value={searchField}
                    onChange={(e) => {
                      setSearchField(e.target.value);
                      setSearchTerm('');
                    }}
                    className="h-12 min-w-[120px] border-0 bg-gray-50 text-sm px-3 py-2 focus:outline-none focus:ring-0 rounded-l-xl"
                  >
                    <option value="all">All</option>
                    <option value="id">Order ID</option>
                    <option value="customer">Customer</option>
                    <option value="email">Email</option>
                    <option value="amount">Amount</option>
                    <option value="status">Status</option>
                    <option value="date">Date</option>
                    <option value="payment_method">Payment Method</option>
                  </select>
                  {searchField === 'status' ? (
                    <select
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        handleSearch(e);
                      }}
                      className="h-12 flex-1 border-0 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-0"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Search by ${searchField === 'all' ? 'order number, customer, email, amount, status, date, payment method' : searchField}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12 flex-1 border-0 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-0"
                    />
                  )}
                  <button
                    onClick={handleSearch}
                    className="h-12 px-5 bg-blue-600 text-white flex items-center justify-center rounded-r-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                    type="button"
                    style={{ minWidth: '48px' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-900">Total Orders</p>
                <p className="text-2xl font-bold text-blue-900">{statistics.total_orders || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-100 via-yellow-200 to-yellow-50 rounded-lg shadow-lg p-6 border border-yellow-200"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-500 rounded-lg shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-yellow-900">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-900">{statistics.pending_orders || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
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
                <p className="text-2xl font-bold text-green-900">{formatCurrency(statistics.total_revenue || 0)}</p>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-900">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(statistics.avg_order_value || 0)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Orders ({orders.length})</h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-400 bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-400">
                  <AnimatePresence>
                  {orders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <motion.tr
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.3, delay: 0.05 * index }}
                        className="hover:bg-blue-50 transition"
                      >
                        <td className="px-6 py-4">
                          <img src={order.items?.[0]?.image_url || '/no-image.png'} alt="Product" className="w-12 h-12 object-cover rounded shadow" />
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">#{order.id}
                          <div className="text-xs text-gray-500">{order.payment_method}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">{order.customer_name}</td>
                        <td className={`px-6 py-4 font-bold ${order.order_status === 'delivered' ? 'text-green-700' : order.order_status === 'cancelled' ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(order.total_amount)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2 py-1 rounded bg-gray-100 text-xs font-semibold">{order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block">
                            <button
                              onClick={() => setSelectedOrder({ ...order, showStatusDropdown: true })}
                              className={`px-2 py-1 rounded-full text-xs font-semibold focus:outline-none ${getStatusColor(order.order_status)} hover:shadow-md`}
                              style={{ minWidth: '90px' }}
                            >
                              {order.order_status}
                            </button>
                            <AnimatePresence>
                            {selectedOrder?.id === order.id && selectedOrder?.showStatusDropdown && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                transition={{ duration: 0.2 }}
                                ref={dropdownRef}
                                className="absolute z-10 mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 animate-fade-in"
                              >
                                <div className="py-2">
                                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((statusOption) => (
                                    <button
                                      key={statusOption}
                                      onClick={() => {
                                        handleStatusUpdate(order.id, statusOption);
                                        setSelectedOrder(null);
                                      }}
                                      className={`block w-full text-left px-4 py-2 text-sm rounded-lg mb-1 last:mb-0 transition-colors duration-100 focus:outline-none focus:bg-blue-100 hover:bg-blue-50 ${getStatusColor(statusOption)}`}
                                    >
                                      {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                            </AnimatePresence>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(order.placed_at)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs shadow"
                          >
                            {expandedOrderId === order.id ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                      {expandedOrderId === order.id && (
                        <motion.tr
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 30 }}
                          transition={{ duration: 0.4 }}
                        >
                          <td colSpan={8} className="bg-blue-50 font-semibold   p-0 border-t-0">
                            <div className="flex  justify-center items-center py-8">
                              <div className="w-full max-w-6xl  bg-white rounded-2xl shadow-2xl border border-blue-200 p-8 flex flex-col md:flex-row gap-10">
                                {/* Left: Order Info */}
                                <div className="flex-1 min-w-[260px] hover:scale-103">
                                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-200 p-8 mb-6">
                                    <div className="flex items-center gap-3 mb-6">
                                      <span className="text-3xl">📦</span>
                                      <h3 className="text-2xl font-extrabold text-blue-900 tracking-tight">Order Information</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 text-base">
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">🎨</span>
                                        <span className="font-semibold text-gray-700">Order ID:</span>
                                        <span className="text-blue-700 font-bold">#{order.id}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">🧑‍💼</span>
                                        <span className="font-semibold text-gray-700">Customer:</span>
                                        <span>{order.customer_name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">📩</span>
                                        <span className="font-semibold text-gray-700">Email:</span>
                                        <span>{order.customer_email}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">📞</span>
                                        <span className="font-semibold text-gray-700">Phone:</span>
                                        <span>{order.customer_phone}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">💰</span>
                                        <span className="font-semibold text-gray-700">Amount:</span>
                                        <span className="font-bold text-green-700">{formatCurrency(order.total_amount)}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">📅</span>
                                        <span className="font-semibold text-gray-700">Date:</span>
                                        <span className=''>{formatDate(order.placed_at)}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-lg">🔖</span>
                                        <span className="font-semibold text-gray-700">Status:</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ml-2 shadow-sm ${getStatusColor(order.order_status)}`}>{order.order_status}</span>
                                      </div>
                                      <div className=" items-center gap-2">
                                        <span className="text-lg">💳</span>
                                        <span className="font-semibold text-gray-700">Payment Method:</span>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ml-2 shadow-sm border ${getPaymentMethodColor(order.payment_method)}`}>{order.payment_method?.toUpperCase()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* Right: Ordered Products & Address */}
                                <div className="flex-1 min-w-[260px]">
                                  <div className="flex items-center gap-2 mb-4">
                                    <span className="text-2xl text-purple-600">🛒</span>
                                    <h4 className="text-lg font-extrabold text-purple-900 tracking-tight">Ordered Products</h4>
                                  </div>
                                  <div className="space-y-3 mb-6 hover:scale-104">
                                    {order.items && order.items.length > 0 ? (
                                      order.items.map((item, idx) => (
                                        <motion.div
                                          key={item.id || idx}
                                          initial={{ opacity: 0, x: 30 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: 30 }}
                                          transition={{ duration: 0.3, delay: 0.1 * idx }}
                                          className="flex items-center gap-4 border border-gray-200 rounded-xl p-3 bg-gray-50 shadow-sm"
                                        >
                                          <img
                                            src={item.image_url || '/no-image.png'}
                                            alt={item.product_name}
                                            className="w-14 h-14 object-cover rounded-lg border border-gray-300"
                                          />
                                          <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{item.product_name}</div>
                                            <div className="text-gray-500 text-sm">Qty: {item.quantity} | Price: {formatCurrency(item.unit_price) }</div>
                                          </div>
                                        </motion.div>
                                      ))
                                    ) : (
                                      <div className="text-gray-500">No items found for this order.</div>
                                    )}
                                  </div>
                                  {order.address_id && addressMap[order.address_id] && addressMap[order.address_id].address && (
                                    <div className="mt-4 p-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl hover:scale-104 border border-blue-200 shadow flex flex-col gap-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg text-blue-700">📍</span>
                                        <span className="font-bold text-blue-900">Delivery Address</span>
                                      </div>
                                      <div className="text-base text-gray-800 font-medium">
                                        {addressMap[order.address_id].address.name} ({addressMap[order.address_id].address.phone})
                                      </div>
                                      <div className="text-base text-gray-700">
                                        {addressMap[order.address_id].address.address_line}, {addressMap[order.address_id].address.city}, {addressMap[order.address_id].address.state}, {addressMap[order.address_id].address.country} - {addressMap[order.address_id].address.pincode}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders; 