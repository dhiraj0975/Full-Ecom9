import axios from 'axios';

export const createPayment = async (paymentData) => {
  // Debug log to check what is being sent
  console.log('Payment Data:', paymentData);
  // paymentData: { customer_id, amount, payment_method, ... }
  return axios.post('/api/payments', paymentData, { withCredentials: true });
};

export const createRazorpayOrder = async (amount) => {
  // amount in INR
  return axios.post('/api/payments/razorpay/order', { amount });
};

export const verifyRazorpayPayment = async (paymentData) => {
  // paymentData: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  return axios.post('/api/payments/razorpay/verify', paymentData);
}; 