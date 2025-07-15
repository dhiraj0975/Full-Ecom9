import { apiGet, apiPost, apiPut, apiDelete } from './httpClient.js';
import { ENDPOINTS } from './config.js';

// Retailer API Functions

// Register new retailer
export const registerRetailer = async (data) => {
  return await apiPost(ENDPOINTS.RETAILER.REGISTER, data);
};

// Login retailer
export const loginRetailer = async (data) => {
  const response = await apiPost(ENDPOINTS.RETAILER.LOGIN, data);
  
  // Store token if login successful
  if (response.success && response.data.token) {
    // Store token in localStorage for API calls
    localStorage.setItem('token', response.data.token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(response.data.retailer));
    
    // Also store in 'retailer' key for backward compatibility
    localStorage.setItem('retailer', JSON.stringify(response.data.retailer));
  }
  
  return response;
};

// Update retailer profile
export const updateRetailer = async (id, data) => {
  return await apiPut(ENDPOINTS.RETAILER.UPDATE(id), data);
};

// Delete retailer
export const deleteRetailer = async (id) => {
  return await apiDelete(ENDPOINTS.RETAILER.DELETE(id));
};

// Get retailer profile (if endpoint exists)
export const getRetailerProfile = async () => {
  return await apiGet(ENDPOINTS.RETAILER.PROFILE);
};

// Update retailer profile
export const updateRetailerProfile = async (data) => {
  return await apiPut(ENDPOINTS.RETAILER.UPDATE_PROFILE, data);
};

// Update bank account details
export const updateBankDetails = async (data) => {
  return await apiPut(ENDPOINTS.RETAILER.UPDATE_BANK_DETAILS, data);
};

// Get bank account details
export const getBankDetails = async () => {
  return await apiGet(ENDPOINTS.RETAILER.GET_BANK_DETAILS);
};

// Logout retailer
export const logoutRetailer = async () => {
  try {
    // Call backend logout endpoint to clear cookies
    await apiPost(ENDPOINTS.RETAILER.LOGOUT);
  } catch (error) {
    console.log('Backend logout failed, but continuing with frontend cleanup');
  } finally {
    // Clear all stored data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('retailer'); // For backward compatibility
    
    // Clear any other stored data
    sessionStorage.clear();
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Get current user data
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};