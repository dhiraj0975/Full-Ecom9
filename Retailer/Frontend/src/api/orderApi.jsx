import httpClient from './httpClient';
import { ENDPOINTS } from './config.js';

// Order API Functions (for future implementation)

// Get all orders (protected)
export const getAllOrders = async () => {
  return await httpClient.get('/orders');
};

// Get order by ID (protected)
export const getOrderById = async (id) => {
  return await httpClient.get(`/orders/${id}`);
};

// Get retailer's orders (protected)
export const getMyOrders = async () => {
  return await httpClient.get('/orders');
};

// Create new order (protected)
export const createOrder = async (orderData) => {
  try {
    const response = await httpClient.post('/orders', orderData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create order' };
  }
};

// Update order (protected)
export const updateOrder = async (id, orderData) => {
  return await httpClient.put(`/orders/${id}`, orderData);
};

// Delete order (protected)
export const deleteOrder = async (id) => {
  return await httpClient.delete(`/orders/${id}`);
};

// Order status management
export const updateOrderStatus = async (id, status, notes = null) => {
  try {
    const response = await httpClient.put(`/orders/${id}/status`, { status, notes });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update order status' };
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  return await httpClient.get('/orders', { params: { status } });
};

// Get orders by date range
export const getOrdersByDateRange = async (startDate, endDate) => {
  return await httpClient.get('/orders', { params: { startDate, endDate } });
};

// Get all orders for retailer
export const getOrders = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await httpClient.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch orders' };
  }
};

// Update payment status
export const updatePaymentStatus = async (orderId, paymentStatus) => {
  try {
    const response = await httpClient.put(`/orders/${orderId}/payment`, { payment_status: paymentStatus });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update payment status' };
  }
};

// Get order status history
export const getOrderStatusHistory = async (orderId) => {
  try {
    const response = await httpClient.get(`/orders/${orderId}/history`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch order history' };
  }
};

// Get order statistics
export const getOrderStatistics = async () => {
  try {
    const response = await httpClient.get('/orders/statistics');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch order statistics' };
  }
};

// Search orders
export const searchOrders = async (searchTerm) => {
  try {
    const response = await httpClient.get('/orders/search', { params: { search: searchTerm } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search orders' };
  }
};

// Get orders by customer for the logged-in retailer
export const getCustomerOrders = async (customerId) => {
  try {
    const response = await httpClient.get(`/orders/customer/${customerId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, message: error.response?.data?.message || 'Failed to fetch customer orders' };
  }
}; 