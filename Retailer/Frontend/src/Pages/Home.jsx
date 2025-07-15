import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Component/Layout';
import { toast } from 'react-toastify';
import { getMyProductStats } from '../api';
import { motion } from 'framer-motion';
import * as jwt_decode from "jwt-decode";
import { getOrderStatistics } from '../api/orderApi';
import { getCustomersWithOrders } from '../api/customerApi';
import { getOrders } from '../api/orderApi';
import { getMyProducts } from '../api/productApi';

const Home = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalEarning: 0,
    deliveredOrders: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [retailerName, setRetailerName] = useState('');
  const [customers, setCustomers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProductUpdates, setRecentProductUpdates] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    // Get retailer name from JWT token
    const token = localStorage.getItem('token');
    let name = '';
    if (token) {
      try {
        const decoded = jwt_decode.default(token);
        console.log('Decoded JWT payload:', decoded); // TEMP: log payload for debugging
        name = decoded.name || decoded.retailer_name || decoded.username || '';
      } catch (e) {
        name = '';
      }
    }
    setRetailerName(name);
    const fetchStats = async () => {
      try {
        setLoading(true);
        const orderStats = await getOrderStatistics();
        // Fetch all customers (large limit)
        const customersRes = await getCustomersWithOrders({ page: 1, limit: 10000 });
        let customersArr = [];
        if (customersRes && customersRes.data && customersRes.data.customers) {
          customersArr = customersRes.data.customers;
        } else if (customersRes.customers) {
          customersArr = customersRes.customers;
        }
        setCustomers(customersArr);
        setDashboardStats({
          totalOrders: orderStats.total_orders || 0,
          totalCustomers: customersArr.length,
          totalEarning: orderStats.total_revenue || 0,
          deliveredOrders: orderStats.delivered_orders || 0,
          pendingOrders: orderStats.pending_orders || 0,
        });
      } catch (e) {
        // fallback: keep zeros
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Fetch recent activity
    const fetchRecentActivity = async () => {
      try {
        // Recent Orders
        const orders = await getOrders();
        if (Array.isArray(orders)) {
          setRecentOrders(
            orders
              .sort((a, b) => new Date(b.placed_at) - new Date(a.placed_at))
              .slice(0, 3)
          );
        }
        // Recent Product Updates
        const productsRes = await getMyProducts();
        let products = [];
        if (productsRes && productsRes.data && productsRes.data.products) {
          products = productsRes.data.products;
        } else if (productsRes.products) {
          products = productsRes.products;
        }
        setRecentProductUpdates(
          products
            .filter(p => p.updated_at)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 3)
        );
        setLowStockProducts(products.filter(p => p.quantity < 10).slice(0, 3));
      } catch (e) {
        // ignore
      }
    };
    fetchRecentActivity();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const productsResponse = await getMyProducts();
      let totalProducts = 0;
      let availableProducts = 0;
      let lowStockProducts = 0;
      let outOfStockProducts = 0;

      if (productsResponse.success) {
        const products = productsResponse.data.products || [];
        totalProducts = products.length;
        
        // Calculate stats
        availableProducts = products.filter(p => p.status === 'available').length;
        lowStockProducts = products.filter(p => p.quantity < 10 && p.quantity > 0).length;
        outOfStockProducts = products.filter(p => p.quantity === 0).length;
      }

      // Fetch additional stats if available
      try {
        const statsResponse = await getMyProductStats();
        if (statsResponse.success) {
          // Use API stats if available, otherwise use calculated stats
          setStats({
            totalProducts: statsResponse.data.total_products || totalProducts,
            availableProducts: statsResponse.data.available_products || availableProducts,
            lowStockProducts: statsResponse.data.low_stock_products || lowStockProducts,
            outOfStockProducts: statsResponse.data.out_of_stock_products || outOfStockProducts
          });
        } else {
          setStats({
            totalProducts,
            availableProducts,
            lowStockProducts,
            outOfStockProducts
          });
        }
      } catch (error) {
        // If stats API fails, use calculated stats
        setStats({
          totalProducts,
          availableProducts,
          lowStockProducts,
          outOfStockProducts
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Quick Actions
  const quickActions = [
    {
      label: 'Add New Product',
      icon: '➕',
      color: 'from-blue-200 to-blue-400',
      onClick: () => navigate('/products', { state: { openAddForm: true } })
    },
    {
      label: 'View Analytics',
      icon: '📊',
      color: 'from-green-200 to-green-400',
      onClick: () => navigate('/analytics')
    },
    {
      label: 'Manage Customers',
      icon: '👥',
      color: 'from-purple-200 to-purple-400',
      onClick: () => navigate('/customers')
    }
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen rounded-2xl shadow-xl">
        {/* Stats Section Header */}
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-block w-2 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></span>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Your Product Stats</h2>
        </div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.15 } }
          }}
        >
          {[
            {
              label: 'Total Orders',
              value: loading ? <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div> : dashboardStats.totalOrders,
              color: 'text-blue-700',
              icon: <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 text-3xl shadow-lg border-2 border-white">🛒</span>,
              bg: 'bg-gradient-to-br from-blue-100 to-blue-50'
            },
            {
              label: 'Total Customers',
              value: loading ? <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div> : customers.length,
              color: 'text-purple-700',
              icon: <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-200 to-purple-400 text-3xl shadow-lg border-2 border-white">👥</span>,
              bg: 'bg-gradient-to-br from-purple-100 to-purple-50'
            },
            {
              label: 'Total Earning',
              value: loading ? <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div> : `₹${dashboardStats.totalEarning}`,
              color: 'text-green-700',
              icon: <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-200 to-green-400 text-3xl shadow-lg border-2 border-white">💰</span>,
              bg: 'bg-gradient-to-br from-green-100 to-green-50'
            },
            {
              label: 'Delivered Orders',
              value: loading ? <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div> : dashboardStats.deliveredOrders,
              color: 'text-blue-700',
              icon: <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 text-3xl shadow-lg border-2 border-white">✅</span>,
              bg: 'bg-gradient-to-br from-blue-100 to-blue-50'
            },
            {
              label: 'Pending Orders',
              value: loading ? <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div> : dashboardStats.pendingOrders,
              color: 'text-yellow-700',
              icon: <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 text-3xl shadow-lg border-2 border-white">⏳</span>,
              bg: 'bg-gradient-to-br from-yellow-100 to-yellow-50'
            }
          ].map((card, idx) => (
            <motion.div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl shadow-xl border border-white/60 ${card.bg} hover:scale-[1.03] active:scale-100 transition-transform duration-200 group p-8`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{card.label}</p>
                  <p className={`text-3xl font-extrabold ${card.color} drop-shadow-sm`}>{card.value}</p>
                </div>
                {card.icon}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Welcome Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-10 mb-10 border border-blue-100 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-3 drop-shadow-lg">
            Welcome back{retailerName ? `, ${retailerName}` : ''}! 👋
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-medium">Here's what's happening with your business today.</p>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-200">
            <h3 className="text-xl font-bold text-blue-700 mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-blue-400 rounded-full"></span>Quick Actions</h3>
            <div className="space-y-4">
              {quickActions.map((action, idx) => (
                <button
                  key={action.label}
                  onClick={action.onClick}
                  className={`w-full text-left p-4 rounded-xl border bg-gradient-to-br ${action.color} hover:scale-[1.02] transition-colors flex items-center gap-3 font-semibold shadow-sm`}
                >
                  <span className="text-2xl rounded-full p-2 shadow border-2 border-white">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-200 rounded-2xl shadow-xl p-8 border border-yellow-200">
            <h3 className="text-xl font-bold text-yellow-700 mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-yellow-400 rounded-full"></span>Recent Activity</h3>
            <div className="space-y-6">
              {/* Recent Orders */}
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-200 to-green-400 rounded-full shadow border-2 border-white text-xl">🟢</div>
                  <div>
                    <p className="text-base font-medium text-gray-700">New order #{order.id} - {order.customer_name}</p>
                    <p className="text-xs text-gray-500">{new Date(order.placed_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
              {/* Recent Product Updates */}
              {recentProductUpdates.map(product => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-200 to-blue-400 rounded-full shadow border-2 border-white text-xl">🔵</div>
                  <div>
                    <p className="text-base font-medium text-gray-700">Product updated: {product.name}</p>
                    <p className="text-xs text-gray-500">{new Date(product.updated_at).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
              {/* Low Stock Alerts */}
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full shadow border-2 border-white text-xl">🟡</div>
                  <div>
                    <p className="text-base font-medium text-gray-700">Low stock: {product.name}</p>
                    <p className="text-xs text-gray-500">Only {product.quantity} left</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 