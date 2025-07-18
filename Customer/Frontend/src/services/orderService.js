import api from '../api/axios';

export const getCustomerOrders = async (customerId) => {
  const response = await api.get(`/api/orders/customer/${customerId}`);
  return response;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}`);
  return response;
};

export const getOrderItems = async (orderId) => {
  const response = await api.get(`/api/order-items/order/${orderId}`);
  return response;
};

export const getOrderInvoice = async (orderId) => {
  const response = await api.get(`/api/orders/${orderId}/invoice`);
  return response;
}; 