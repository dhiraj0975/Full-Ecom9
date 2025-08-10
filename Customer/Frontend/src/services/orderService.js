import api from '../api/axios';

export const getCustomerOrders = async (customerId) => {
  // If customerId is not provided, get it from localStorage
  if (!customerId) {
    customerId = localStorage.getItem('customer_id');
    if (!customerId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        customerId = user.id;
      }
    }
  }
  
  if (!customerId) {
    throw new Error('Customer not logged in');
  }
  
  console.log('🔍 Fetching orders for customer ID:', customerId);
  const response = await api.get(`/api/orders/customer/${customerId}`);
  console.log('📦 Orders API response:', response.data);
  
  // Handle different response formats from backend
  if (response.data && response.data.success && response.data.orders) {
    return response.data.orders;
  } else if (Array.isArray(response.data)) {
    return response.data;
  } else if (response.data && Array.isArray(response.data.orders)) {
    return response.data.orders;
  } else {
    console.warn('⚠️ Unexpected orders response format:', response.data);
    return [];
  }
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`);
  return response.data;
};

export const getOrderItems = async (orderId) => {
  const response = await api.get(`/api/order-items/order/${orderId}`);
  return Array.isArray(response.data) ? response.data : (Array.isArray(response.data.items) ? response.data.items : []);
};

export const getOrderInvoice = async (orderId) => {
  try {
    console.log('📄 Downloading invoice for order:', orderId);
    const response = await api.get(`/api/orders/${orderId}/invoice`, {
      responseType: 'blob', // Important for PDF download
      headers: {
        'Accept': 'application/pdf'
      }
    });
    console.log('✅ Invoice downloaded successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Invoice download error:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId, reason) => {
  try {
    console.log('🔄 Cancelling order:', orderId, 'with reason:', reason);
    const response = await api.post(`/api/orders/${orderId}/cancel`, {
      reason
    });
    console.log('✅ Order cancelled successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Cancel order error:', error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to cancel order');
  }
};
