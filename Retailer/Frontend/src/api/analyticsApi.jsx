import { apiGet } from './httpClient.js';
import { ENDPOINTS } from './config.js';

// Analytics API Functions (for future implementation)

// Get dashboard analytics (protected)
export const getDashboardAnalytics = async () => {
  return await apiGet(ENDPOINTS.ANALYTICS.DASHBOARD);
};

// Get sales analytics (protected)
export const getSalesAnalytics = async (period = 'month') => {
  return await apiGet(`${ENDPOINTS.ANALYTICS.SALES}?period=${period}`);
};

// Get product analytics (protected)
export const getProductAnalytics = async () => {
  return await apiGet(ENDPOINTS.ANALYTICS.PRODUCTS);
};

// Get revenue analytics
export const getRevenueAnalytics = async (startDate, endDate) => {
  return await apiGet(`${ENDPOINTS.ANALYTICS.SALES}/revenue?startDate=${startDate}&endDate=${endDate}`);
};

// Get top selling products
export const getTopSellingProducts = async (limit = 10) => {
  return await apiGet(`${ENDPOINTS.ANALYTICS.PRODUCTS}/top-selling?limit=${limit}`);
};

// Get customer analytics
export const getCustomerAnalytics = async () => {
  return await apiGet(`${ENDPOINTS.ANALYTICS.DASHBOARD}/customers`);
};

// Get inventory analytics
export const getInventoryAnalytics = async () => {
  return await apiGet(`${ENDPOINTS.ANALYTICS.PRODUCTS}/inventory`);
}; 