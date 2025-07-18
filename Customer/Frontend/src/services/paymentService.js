import api from '../api/axios';

export const makePayment = (paymentData) => api.post('/api/payments', paymentData);
export const createRazorpayOrder = (amount) => api.post('/api/payments/razorpay/order', { amount });
export const verifyRazorpayPayment = (paymentData) => api.post('/api/payments/razorpay/verify', paymentData); 