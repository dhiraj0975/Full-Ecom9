import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, getOrderDetails, downloadInvoice } from '../../services/orderService';
import { getAddressById } from '../../services/addressService';
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
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops! Something went wrong',
        text: 'Failed to load your orders. Please try again.',
        confirmButtonColor: '#3B82F6',
      });
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
        const details = await getOrderDetails(orderId);
        console.log('📦 Order details fetched:', details);
        console.log('📦 Order items:', details.items);
        
        let address = null;
        if (addressId) {
          console.log('🏠 Fetching address for addressId:', addressId);
          try {
            const addressRes = await getAddressById(addressId);
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
        setOrderDetailsMap(prev => ({ ...prev, [orderId]: { ...details, address } }));
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

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'all') return true;
    return order.order_status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingInvoiceId(orderId);
    try {
      const blob = await downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      Swal.fire({
        icon: 'success',
        title: 'Invoice Downloaded!',
        text: 'Your invoice has been downloaded successfully.',
        confirmButtonColor: '#10B981',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Download Failed', 
        text: 'Failed to download invoice. Please try again.',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const copyOrderId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    Swal.fire({
      icon: 'success',
      title: 'Copied!',
      text: 'Order ID copied to clipboard',
      confirmButtonColor: '#3B82F6',
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="text-center lg:text-left mb-8 lg:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
                  My Orders
                </h1>
                <p className="text-xl text-blue-100 max-w-2xl">
                  Track all your orders, view details, and manage your shopping history
                </p>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 border border-white/30">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/30 rounded-full p-3">
                    <ShoppingBag className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-white">
                    <div className="text-2xl font-bold">{orders.length}</div>
                    <div className="text-sm opacity-90">Total Orders</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-20 right-20 w-16 h-16 bg-white/5 rounded-full"></div>
          <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-white/10 rounded-full"></div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/90 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl hover:shadow-purple-300/60 hover:scale-[1.02] transition-all duration-300"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              
              {showFilters && (
                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        filterStatus === status
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </motion.div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
          >
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-blue-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-sm font-bold">0</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">No orders yet!</h3>
            <p className="text-gray-600 mb-8 max-w-md">
              Looks like you haven't placed any orders yet. Start shopping and discover amazing products!
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
          <div className="space-y-6">
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
                  <div className="bg-white/90 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl hover:shadow-indigo-300/70 hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {order.first_product_image_url ? (
                            <div className="relative">
                              <img
                                src={order.first_product_image_url}
                                alt="Product"
                                className="w-20 h-20 lg:w-24 lg:h-24 object-cover rounded-xl shadow-md border border-gray-100"
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
                            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                              <Package className="h-10 w-10 text-blue-400" />
                            </div>
                          )}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                  #{order.id}
                                </div>
                                <button
                                  onClick={() => copyOrderId(order.id)}
                                  className="text-gray-400 hover:text-blue-500 transition-colors"
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

                              {order.first_product_name && (
                                <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                                  {order.first_product_name}
                                  {order.product_count > 1 && (
                                    <span className="text-gray-500 ml-2">+{order.product_count - 1} more items</span>
                                  )}
                                </h3>
                              )}

                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {formatDate(order.placed_at)}
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-lg text-blue-600">
                                  <DollarSign className="h-4 w-4" />
                                  ₹{order.total_amount}
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3">
                              <button
                                onClick={() => handleToggleExpand(order.id, order.address_id)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-4 w-4" />
                                    Hide Details
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4" />
                                    View Details
                                  </>
                                )}
                              </button>
                              
                              <button
                                onClick={() => handleDownloadInvoice(order.id)}
                                disabled={downloadingInvoiceId === order.id}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                              >
                                {downloadingInvoiceId === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                                Invoice
                              </button>
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
                          className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-blue-50 max-h-[70vh] overflow-y-auto"
                        >
                          {fetchingDetails === order.id || !details ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-3" />
                              <span className="text-gray-600">Loading order details...</span>
                            </div>
                          ) : (
                            <div className="p-6 min-h-[400px]">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Order Summary */}
                                <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-white/50 hover:shadow-2xl hover:shadow-pink-300/60 hover:scale-[1.03] transition-all duration-300">
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
                                      <span className="text-gray-600">Shipping</span>
                                      <span className="font-medium">₹{details.order.delivery_charge || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Discount</span>
                                      <span className="font-medium text-green-600">-₹{details.order.discount || 0}</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                                      <span>Total</span>
                                      <span className="text-blue-600">₹{details.order.total_amount}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-white/50 hover:shadow-2xl hover:shadow-cyan-300/60 hover:scale-[1.03] transition-all duration-300">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-2 rounded-lg">
                                      <MapPin className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Shipping Address</h4>
                                  </div>
                                  {details.address ? (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                      <div className="space-y-2 text-sm">
                                        <div className="font-semibold text-gray-800 text-base">{details.address.name}</div>
                                        <div className="text-gray-600">
                                          {details.address.address_line}, {details.address.city}, {details.address.state} {details.address.pincode}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                          <Phone className="h-4 w-4" />
                                          Phone: {details.address.phone}
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

                                {/* Payment Method */}
                                <div className="bg-white/80 rounded-xl p-6 shadow-sm border border-white/50 hover:shadow-2xl hover:shadow-emerald-300/60 hover:scale-[1.03] transition-all duration-300">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-2 rounded-lg">
                                      <CreditCard className="h-5 w-5" />
                                    </div>
                                    <h4 className="font-semibold text-gray-800">Payment Method</h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="bg-green-100 p-3 rounded-lg">
                                      <CreditCard className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-800">
                                        {details.order.payment_method || 'Not specified'}
                                      </div>
                                      <div className="text-sm text-gray-500">Payment completed</div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                               {/* Order Timeline & Tracking */}
                               <div className="mt-6 bg-white/80 rounded-xl p-6 shadow-sm border border-white/50 hover:shadow-2xl hover:shadow-violet-300/60 hover:scale-[1.02] transition-all duration-300">
                                 <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                   <Truck className="h-5 w-5 text-blue-500" />
                                   Order Timeline & Tracking
                                 </h4>
                                 
                                 {/* Order Status Timeline */}
                                 <div className="mb-6">
                                   <div className="flex items-center justify-between mb-4">
                                     <span className="text-sm font-medium text-gray-700">Order Progress</span>
                                     <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                                       <span className="flex items-center gap-1">
                                         {getStatusIcon(order.order_status)}
                                         {order.order_status}
                                       </span>
                                     </span>
                                   </div>
                                   
                                   <div className="relative overflow-x-auto">
                                     <div className="flex items-center justify-between min-w-[600px] sm:min-w-full">
                                       {[
                                         { label: 'Order Placed', icon: <Package className="h-4 w-4" />, status: 'completed', date: formatDate(details.order.placed_at) },
                                         { label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" />, status: order.order_status === 'confirmed' || order.order_status === 'shipped' || order.order_status === 'delivered' ? 'completed' : 'pending' },
                                         { label: 'Shipped', icon: <Truck className="h-4 w-4" />, status: order.order_status === 'shipped' || order.order_status === 'delivered' ? 'completed' : 'pending' },
                                         { label: 'Delivered', icon: <CheckCircle className="h-4 w-4" />, status: order.order_status === 'delivered' ? 'completed' : 'pending' }
                                       ].map((step, index) => (
                                         <div key={index} className="flex flex-col items-center flex-shrink-0">
                                           <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 ${
                                             step.status === 'completed' 
                                               ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-400' 
                                               : 'bg-gray-200 border-gray-300'
                                           }`}>
                                             {step.icon}
                                           </div>
                                           <span className="text-xs font-medium mt-2 text-gray-600 text-center max-w-20">{step.label}</span>
                                           {step.date && (
                                             <span className="text-xs text-gray-500 mt-1 text-center">{step.date}</span>
                                           )}
                                         </div>
                                       ))}
                                     </div>
                                     
                                     {/* Progress Bar */}
                                     <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10">
                                       <div 
                                         className={`h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500 ${
                                           order.order_status === 'delivered' ? 'w-full' :
                                           order.order_status === 'shipped' ? 'w-2/3' :
                                           order.order_status === 'confirmed' ? 'w-1/3' : 'w-0'
                                         }`}
                                       ></div>
                                     </div>
                                   </div>
                                 </div>

                                 {/* Tracking Number (if available) */}
                                 {details.order.tracking_number && (
                                   <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 hover:shadow-2xl hover:shadow-blue-300/70 hover:scale-[1.02] transition-all duration-300">
                                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                       <div className="flex items-center gap-3">
                                         <div className="bg-blue-500 p-2 rounded-lg">
                                           <Truck className="h-5 w-5 text-white" />
                                         </div>
                                         <div>
                                           <span className="font-medium text-gray-800">Tracking Number</span>
                                           <p className="text-sm text-gray-600">Track your package delivery</p>
                                         </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                         <span className="font-mono text-sm bg-white px-4 py-2 rounded-lg border border-blue-200 shadow-sm break-all">
                                           {details.order.tracking_number}
                                         </span>
                                         <button
                                           onClick={() => copyOrderId(details.order.tracking_number)}
                                           className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0"
                                           title="Copy tracking number"
                                         >
                                           <Copy className="h-4 w-4" />
                                         </button>
                                       </div>
                                     </div>
                                   </div>
                                 )}

                                 {/* Estimated Delivery (if available) */}
                                 {details.order.estimated_delivery && (
                                   <div className="mt-4 bg-green-50 rounded-lg p-4 border border-green-200 hover:shadow-2xl hover:shadow-green-300/70 hover:scale-[1.02] transition-all duration-300">
                                     <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                       <div className="flex items-center gap-3">
                                         <div className="bg-green-500 p-2 rounded-lg">
                                           <Calendar className="h-5 w-5 text-white" />
                                         </div>
                                         <div>
                                           <span className="font-medium text-gray-800">Estimated Delivery</span>
                                           <p className="text-sm text-gray-600">Expected delivery date</p>
                                         </div>
                                       </div>
                                       <div className="sm:ml-auto">
                                         <span className="font-semibold text-green-600">{formatDate(details.order.estimated_delivery)}</span>
                                       </div>
                                     </div>
                                   </div>
                                 )}
                               </div>

                               {/* Order Items */}
                               {details.items && details.items.length > 0 && (
                                 <div className="mt-6 bg-white/80 rounded-xl p-6 shadow-sm border border-white/50 hover:shadow-2xl hover:shadow-orange-300/60 hover:scale-[1.02] transition-all duration-300">
                                   <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                     <Package className="h-5 w-5 text-blue-500" />
                                     Order Items ({details.items.length})
                                   </h4>
                                   <div className="space-y-4 overflow-x-auto max-h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
                                     {details.items.map((item, index) => {
                                       console.log('🖼️ Item image data:', {
                                         itemName: item.product_name,
                                         imageUrl: item.image_url,
                                         fallbackUrl: '/images/product-placeholder.png'
                                       });
                                       
                                       return (
                                         <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-w-[500px] sm:min-w-full">
                                           <div className="relative flex-shrink-0">
                                             <img
                                               src={item.image_url || '/images/product-placeholder.png'}
                                               alt={item.product_name}
                                               className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                               onError={(e) => {
                                                 console.log('❌ Image failed to load:', e.target.src);
                                                 e.target.onerror = null;
                                                 e.target.src = '/images/product-placeholder.png';
                                               }}
                                               onLoad={() => {
                                                 console.log('✅ Image loaded successfully:', item.image_url);
                                               }}
                                             />
                                             <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                               {item.quantity}
                                             </div>
                                           </div>
                                           <div className="flex-1 min-w-0">
                                             <h5 className="font-medium text-gray-800 mb-2 truncate">{item.product_name}</h5>
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm text-gray-600">
                                               <div className="flex items-center gap-2">
                                                 <Package className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                 <span className="truncate">Quantity: <span className="font-semibold">{item.quantity}</span></span>
                                               </div>
                                               <div className="flex items-center gap-2">
                                                 <Calendar className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                 <span className="truncate">Added: <span className="font-semibold">{formatDate(item.created_at || details.order.placed_at)}</span></span>
                                               </div>
                                             </div>
                                           </div>
                                           <div className="text-right flex-shrink-0">
                                             <div className="font-semibold text-gray-800 text-lg">₹{item.price}</div>
                                             <div className="text-sm text-gray-500">Total: ₹{item.price * item.quantity}</div>
                                           </div>
                                         </div>
                                       );
                                     })}
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