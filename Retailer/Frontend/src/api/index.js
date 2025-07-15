// API Index - Export all API functions

// Configuration and HTTP Client
export { default as API_CONFIG } from './config.js';
export { default as httpClient } from './httpClient.js';
export { ENDPOINTS, HTTP_METHODS } from './config.js';

// Retailer API
export {
  registerRetailer,
  loginRetailer,
  updateRetailer,
  deleteRetailer,
  getRetailerProfile,
  updateRetailerProfile,
  updateBankDetails,
  getBankDetails,
  logoutRetailer,
  isAuthenticated,
  getCurrentUser,
} from './retailerApi.jsx';

// Product API
export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
  getMyProductStats,
  searchProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  bulkUpdateProducts,
  bulkDeleteProducts,
} from './productApi.jsx';

// Subcategory API
export {
  getAllSubcategories,
  getSubcategoryById,
} from './subcategoryApi.jsx';

// Order API (for future implementation)
export {
  getAllOrders,
  getOrderById,
  getMyOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrdersByStatus,
  getOrdersByDateRange,
} from './orderApi.jsx';

// Analytics API (for future implementation)
export {
  getDashboardAnalytics,
  getSalesAnalytics,
  getProductAnalytics,
  getRevenueAnalytics,
  getTopSellingProducts,
  getCustomerAnalytics,
  getInventoryAnalytics,
} from './analyticsApi.jsx';

// Utility functions
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  
  return {
    message: error.error?.message || 'An error occurred',
    status: error.status || 500,
  };
};

export const formatApiResponse = (response) => {
  if (response.success) {
    return {
      data: response.data,
      status: response.status,
      success: true,
    };
  } else {
    return {
      error: response.error,
      status: response.status,
      success: false,
    };
  }
}; 