const express = require('express');
const router = express.Router();
const { createPayment, updatePayment, getPaymentById, createOrder, verifyPayment } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Create a new payment
router.post('/', authenticateToken, createPayment);

// Update payment
router.put('/:id', authenticateToken, updatePayment);

// Get payment by ID
router.get('/:id', authenticateToken, getPaymentById);

// Razorpay create order
router.post('/razorpay/order', createOrder);
// Razorpay verify payment
router.post('/razorpay/verify', verifyPayment);

module.exports = router; 