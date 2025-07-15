import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/E_Commerce_Transparent_LOGO.png';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '📊',
      path: '/home',
      description: 'Overview of your business'
    },
    {
      title: 'Products',
      icon: '📦',
      path: '/products',
      description: 'Manage your products'
    },
    {
      title: 'Orders',
      icon: '🛒',
      path: '/orders',
      description: 'View and manage orders'
    },
    {
      title: 'Customers',
      icon: '👥',
      path: '/customers',
      description: 'Customer management'
    },
    {
      title: 'Analytics',
      icon: '📈',
      path: '/analytics',
      description: 'Sales and performance data'
    },
    {
      title: 'Profile',
      icon: '👤',
      path: '/profile',
      description: 'Your account settings'
    },
    {
      title: 'Settings',
      icon: '⚙️',
      path: '/settings',
      description: 'App configuration'
    }
  ];

  return (
    <motion.div
      animate={{ width: isOpen ? 256 : 64 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className={`bg-white shadow-lg h-screen transition-all duration-300 overflow-hidden`}
      style={{ minWidth: isOpen ? 256 : 64 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {isOpen && (
              <motion.img
                src={logo}
                alt="E-Commerce Logo"
                initial={{ opacity: 0, scale: 0.7, y: -10 }}or 
                exit={{ opacity: 0, scale: 0.7, y: -10 }}
                animate={{ opacity: 1, scale: [1, 1.08, 1], y: 0 }}
                transition={{ opacity: { duration: 0.4 }, scale: { duration: 2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' } }}
                className="h-15 w-auto object-contain drop-shadow-md cursor-pointer"
                draggable={false}
                whileHover={{ rotate: 8, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/home')}
              />
            )}
          </AnimatePresence>
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            {isOpen ? '◀️' : '▶️'}
          </motion.button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold"
          >
            {currentUser?.name?.charAt(0).toUpperCase() || 'R'}
          </motion.div>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <p className="font-semibold text-gray-800">
                  {currentUser?.name || 'Retailer'}
                </p>
                <p className="text-sm text-gray-500">Online</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        <AnimatePresence>
          {menuItems.map((item, idx) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ delay: 0.05 * idx, duration: 0.3 }}
            >
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-600 border-r-2 border-blue-600'
                    : 'text-gray-700'
                }`}
              >
                <motion.span
                  whileHover={{ scale: 1.2, rotate: 8 }}
                  className="text-xl"
                >
                  {item.icon}
                </motion.span>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </nav>
    </motion.div>
  );
};

export default Sidebar; 