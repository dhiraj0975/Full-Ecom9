const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Create order
router.post('/', orderController.createOrder);

// Get all orders
router.get('/', orderController.getAllOrders);

// Get order by ID
router.get('/:id', orderController.getOrderById);

// Get orders by customer ID
router.get('/customer/:customer_id', orderController.getOrdersByCustomerId);

// Update order
router.put('/:id', orderController.updateOrder);

// Update order status only
router.patch('/:id/status', orderController.updateOrderStatus);

// Delete order
router.delete('/:id', orderController.deleteOrder);

// Download invoice as PDF
router.get('/:id/invoice', orderController.downloadInvoice);

module.exports = router; 