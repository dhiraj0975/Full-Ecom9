import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCustomerOrders, getOrderById, getOrderItems, getOrderInvoice } from '../../services/orderService';
import { getAddress } from '../../services/addressService';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  Calendar,
  MapPin,
  CreditCard,
  ArrowLeft,
  Loader2,
  Filter,
  ChevronDown,
  ChevronUp,
  CreditCard as CardIcon,
  DollarSign,
  ShoppingBag,
  Star,
  Download,
  Copy,
  ExternalLink,
  Phone,
  Mail,
  Home,
  Building
} from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [orderDetailsMap, setOrderDetailsMap] = useState({});
  const [fetchingDetails, setFetchingDetails] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
    
    // Listen for order updates (when new order is placed)
    const handleOrderUpdate = () => {
      console.log('🔄 Order update detected, refreshing orders...');
      fetchOrders();
    };
    
    window.addEventListener('order-placed', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('order-placed', handleOrderUpdate);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Starting to fetch orders...');
      const ordersData = await getCustomerOrders(); // No need to pass customerId, service will handle it
      console.log('📋 Received orders data:', ordersData);
      
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      
      if (error.message === 'Customer not logged in') {
        Swal.fire({
          icon: 'warning',
          title: 'Please Login',
          text: 'You need to login to view your orders.',
          confirmButtonColor: '#3B82F6',
        }).then(() => {
          navigate('/login');
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops! Something went wrong',
          text: 'Failed to load your orders. Please try again.',
          confirmButtonColor: '#3B82F6',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = async (orderId, addressId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      return;
    }
    if (!orderDetailsMap[orderId]) {
      setFetchingDetails(orderId);
      try {
        console.log('🔍 Fetching order details for orderId:', orderId);
        const details = await getOrderById(orderId);
        const items = await getOrderItems(orderId);
        console.log('📦 Order details fetched:', details);
        console.log('📦 Order items:', items);
        
        let address = null;
        if (addressId) {
          console.log('🏠 Fetching address for addressId:', addressId);
          try {
            const addressRes = await getAddress(addressId);
            console.log('📍 Address response:', addressRes);
            address = addressRes.address || addressRes;
            console.log('📍 Final address data:', address);
          } catch (e) { 
            console.error('❌ Address fetch error:', e);
            address = null; 
          }
        } else {
          console.log('⚠️ No addressId provided for order:', orderId);
        }
        
        console.log('💾 Setting order details with address:', { ...details, address });
        setOrderDetailsMap(prev => ({ ...prev, [orderId]: { ...details, address, items } }));
      } catch (error) {
        console.error('❌ Order details fetch error:', error);
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: 'Failed to load order details.',
          confirmButtonColor: '#3B82F6',
        });
      } finally {
        setFetchingDetails(null);
      }
    }
    setExpandedOrderId(orderId);
  };

  const getStatusColor = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId.toString());
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: `Order ID #${orderId} copied to clipboard`,
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.order_status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingInvoiceId(orderId);
    try {
      console.log('📄 Starting invoice download for order:', orderId);
      
      const blob = await getOrderInvoice(orderId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // Success notification
      Swal.fire({
        icon: 'success',
        title: '📄 Invoice Downloaded!',
        text: `Invoice for Order #${orderId} has been downloaded successfully.`,
        confirmButtonColor: '#10B981',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      
      console.log('✅ Invoice download completed for order:', orderId);
      
    } catch (error) {
      console.error('❌ Invoice download failed:', error);
      
      let errorMessage = 'Failed to download invoice. Please try again.';
      
      if (error.response?.status === 404) {
        errorMessage = 'Invoice not found for this order.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error while generating invoice.';
      }
      
      Swal.fire({ 
        icon: 'error', 
        title: '❌ Download Failed', 
        text: errorMessage,
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Try Again'
      });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-10 w-10 text-blue-600 animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Your Orders</h3>
          <p className="text-gray-600">Please wait while we fetch your order history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                <ShoppingBag className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">My Orders</h1>
            </div>
            <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
              Track your orders, view details, and manage your shopping history
            </p>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold">{orders.length}</div>
                <div className="text-sm opacity-90">Total Orders</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold">
                  {orders.filter(o => o.order_status === 'delivered').length}
                </div>
                <div className="text-sm opacity-90">Delivered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-2xl font-bold">
                  {orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.order_status)).length}
                </div>
                <div className="text-sm opacity-90">In Progress</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap gap-2"
                  >
                    {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                          filterStatus === status
                            ? 'bg-blue-500 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="text-sm text-gray-600 font-medium">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-sm font-bold">0</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {filterStatus === 'all' ? 'No orders yet!' : `No ${filterStatus} orders found`}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md">
              {filterStatus === 'all' 
                ? "Looks like you haven't placed any orders yet. Start shopping and discover amazing products!"
                : `You don't have any ${filterStatus} orders at the moment.`
              }
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <ShoppingBag className="h-5 w-5" />
              Start Shopping
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredOrders.map((order, idx) => {
              const isExpanded = expandedOrderId === order.id;
              const details = orderDetailsMap[order.id];
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="group"
                >
                  {/* Main Order Card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0 self-center lg:self-start">
                          {order.first_product_image_url ? (
                            <div className="relative">
                              <img
                                src={order.first_product_image_url}
                                alt="Product"
                                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-cover rounded-xl shadow-md border border-gray-100"
                                onError={e => { 
                                  e.target.onerror = null; 
                                  e.target.src = '/images/product-placeholder.png'; 
                                }}
                              />
                              {order.product_count > 1 && (
                                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                  +{order.product_count - 1}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                              <Package className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400" />
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-3">
                            {/* Order Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  #{order.id}
                                </div>
                                <button
                                  onClick={() => copyOrderId(order.id)}
                                  className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                                  title="Copy Order ID"
                                >
                                  <Copy className="h-4 w-4" />
                                </button>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.order_status)}`}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(order.order_status)}
                                    {order.order_status}
                                  </span>
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDownloadInvoice(order.id)}
                                  disabled={downloadingInvoiceId === order.id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Download Invoice PDF"
                                >
                                  {downloadingInvoiceId === order.id ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      <span className="hidden sm:inline">Downloading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Download className="h-4 w-4" />
                                      <span className="hidden sm:inline">Invoice</span>
                                    </>
                                  )}
                                </button>
                                
                                <button
                                  onClick={() => handleToggleExpand(order.id, order.address_id)}
                                  disabled={fetchingDetails === order.id}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50"
                                  title={isExpanded ? 'Hide Order Details' : 'View Order Details'}
                                >
                                  {fetchingDetails === order.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {isExpanded ? 'Hide' : 'View'} Details
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* Product Name */}
                            {order.first_product_name && (
                              <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">
                                {order.first_product_name}
                                {order.product_count > 1 && (
                                  <span className="text-gray-500 ml-2">+{order.product_count - 1} more items</span>
                                )}
                              </h3>
                            )}

                            {/* Order Meta */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span className="hidden sm:inline">Ordered:</span>
                                  {formatDate(order.placed_at)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-1 font-semibold text-lg text-blue-600">
                                <DollarSign className="h-4 w-4" />
                                ₹{order.total_amount}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50"
                        >
                          {fetchingDetails === order.id || !details ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                              <span className="text-gray-600">Loading order details...</span>
                            </div>
                          ) : (
                            <div className="p-4 sm:p-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Order Summary */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg">
                                      <DollarSign className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Order Summary</h4>
                                  </div>
                                  <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Subtotal</span>
                                      <span className="font-medium">₹{details.order.total_amount - (details.order.delivery_charge || 0) - (details.order.discount || 0)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Delivery Charge</span>
                                      <span className="font-medium">₹{details.order.delivery_charge || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Discount</span>
                                      <span className="font-medium text-green-600">-₹{details.order.discount || 0}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between">
                                      <span className="font-semibold text-gray-800">Total</span>
                                      <span className="font-bold text-lg text-blue-600">₹{details.order.total_amount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Payment Method</span>
                                      <span className="font-medium capitalize">{details.order.payment_method}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-lg">
                                      <MapPin className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Shipping Address</h4>
                                  </div>
                                  {details.address ? (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="space-y-2 text-sm">
                                        <div className="font-semibold text-gray-800">{details.address.name}</div>
                                        <div className="text-gray-600">
                                          {details.address.address_line}, {details.address.city}, {details.address.state} {details.address.pincode}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Phone className="h-4 w-4" />
                                          {details.address.phone}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-gray-500 text-sm bg-gray-50 rounded-lg p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="h-4 w-4 text-red-500" />
                                        <span className="font-medium">Address information not available</span>
                                      </div>
                                      <p className="text-xs">Please contact customer support for address details.</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Order Items */}
                              {details.items && details.items.length > 0 && (
                                <div className="mt-6 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-blue-500" />
                                    Order Items ({details.items.length})
                                  </h4>
                                  <div className="space-y-4 max-h-64 overflow-y-auto">
                                    {details.items.map((item, index) => (
                                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                        <img
                                          src={item.image_url || '/images/product-placeholder.png'}
                                          alt={item.product_name}
                                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/product-placeholder.png';
                                          }}
                                        />
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-medium text-gray-800 text-sm sm:text-base line-clamp-2">
                                            {item.product_name}
                                          </h5>
                                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                            <span>Qty: {item.quantity}</span>
                                            <span>Price: ₹{item.price}</span>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-semibold text-gray-800">₹{item.price * item.quantity}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory; 
