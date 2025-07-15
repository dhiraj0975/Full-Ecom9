const express = require('express');
const router = express.Router();
const orderItemController = require('../controllers/orderItemController');

// Create order items (bulk)
router.post('/', orderItemController.createOrderItems);

// Get all items for a specific order
router.get('/order/:order_id', orderItemController.getOrderItemsByOrderId);

// Update an order item
router.put('/:id', orderItemController.updateOrderItem);

// Delete an order item
router.delete('/:id', orderItemController.deleteOrderItem);

module.exports = router; 