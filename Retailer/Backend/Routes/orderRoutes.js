const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Test route (no authentication required)
router.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.json({ message: 'Order routes are working!' });
});

// Test route for debugging
router.get('/debug', (req, res) => {
  console.log('Debug route hit!');
  res.json({ 
    message: 'Debug route working!',
    timestamp: new Date().toISOString(),
    userAgent: req.headers['user-agent']
  });
});

// Test order creation route (for demonstration)
router.post('/test-create', orderController.createTestOrder);

// All routes require authentication
router.use(authMiddleware); // Now enabled for JWT auth

// Order management routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/statistics', orderController.getOrderStatistics);
router.get('/search', orderController.searchOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/payment', orderController.updatePaymentStatus);
router.delete('/:id', orderController.deleteOrder);

// Customer orders route
router.get('/customer/:customerId', orderController.getOrdersByCustomer);

module.exports = router; 