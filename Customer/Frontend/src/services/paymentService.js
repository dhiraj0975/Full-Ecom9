import api from '../api/axios';

// Get API URL from environment
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  console.log('🔧 Payment Service API URL:', apiUrl);
  return apiUrl || '';
};

export const makePayment = (paymentData) => {
  const apiUrl = getApiUrl();
  return api.post(`${apiUrl}/api/payments`, paymentData);
};

export const createRazorpayOrder = (amount) => {
  const apiUrl = getApiUrl();
  return api.post(`${apiUrl}/api/payments/razorpay/order`, { amount });
};

export const verifyRazorpayPayment = (paymentData) => {
  const apiUrl = getApiUrl();
  return api.post(`${apiUrl}/api/payments/razorpay/verify`, paymentData);
}; 