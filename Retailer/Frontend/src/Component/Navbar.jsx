import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutRetailer, getCurrentUser } from '../api';
import { toast } from 'react-toastify';
// import { useTheme } from './Layout';

const Navbar = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  // const { theme, setTheme } = useTheme ? useTheme() : { theme: 'light', setTheme: () => {} };

  const handleLogout = async () => {
    try {
      await logoutRetailer();
      toast.success('Logout successful! See you again! 👋');

      // ✅ Delay navigation so toast can be seen
      setTimeout(() => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
      }, 1500); // 1.5 seconds
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/home':
        return 'Dashboard';
      case '/products':
        return 'Products';
      case '/orders':
        return 'Orders';
      case '/customers':
        return 'Customers';
      case '/analytics':
        return 'Analytics';
      case '/profile':
        return 'Profile';
      case '/settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Page title */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              {getPageTitle()}
            </h1>
            <div className="ml-4 text-sm text-gray-500">Retailer Portal</div>
          </div>

          {/* Right side - User profile and logout */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <span className="text-xl">🔔</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser?.name?.charAt(0).toUpperCase() || 'R'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-800">
                    {currentUser?.name || 'Retailer'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.email || 'retailer@example.com'}
                  </p>
                </div>
                <span className="text-gray-400">▼</span>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">
                      {currentUser?.name || 'Retailer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentUser?.email || 'retailer@example.com'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    👤 Profile Settings
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    ⚙️ Settings
                  </button>

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
