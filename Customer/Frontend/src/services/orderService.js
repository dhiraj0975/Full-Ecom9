import axios from 'axios';

// Get all orders for current user
export const getMyOrders = async () => {
  try {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const customerId = user?.id || localStorage.getItem('customer_id');
    
    if (!customerId) {
      throw new Error('User not logged in');
    }
    
    const response = await axios.get(`/api/orders/customer/${customerId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order by ID with details
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`/api/orders/${orderId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order items for an order
export const getOrderItems = async (orderId) => {
  try {
    const response = await axios.get(`/api/order-items/order/${orderId}`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get complete order details with items
export const getOrderDetails = async (orderId) => {
  try {
    const [orderResponse, itemsResponse] = await Promise.all([
      getOrderById(orderId),
      getOrderItems(orderId)
    ]);
    
    return {
      order: orderResponse.order,
      items: itemsResponse.items
    };
  } catch (error) {
    throw error;
  }
};

// Download invoice PDF
export const downloadInvoice = async (orderId) => {
  try {
    const response = await axios.get(`/api/orders/${orderId}/invoice`, {
      responseType: 'blob',
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 