import api from '../api/axios';

export const getCustomerOrders = async (customerId) => {
  const response = await api.get(`/api/orders/customer/${customerId}`);
  return Array.isArray(response.data) ? response.data : (Array.isArray(response.data.orders) ? response.data.orders : []);
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
  const response = await api.get(`/api/orders/${orderId}/invoice`);
  return response.data;
}; 