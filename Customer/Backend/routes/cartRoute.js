const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

// Add to cart
router.post('/add', authenticateToken, cartController.addToCart);
// Get cart items
router.get('/', authenticateToken, cartController.getCart);
// Remove from cart
router.delete('/remove/:id', authenticateToken, cartController.removeFromCart);
// Update cart item quantity
router.put('/update/:id', authenticateToken, cartController.updateCartItemQuantity);
// Clear cart
router.delete('/clear', authenticateToken, cartController.clearCart);

module.exports = router; 