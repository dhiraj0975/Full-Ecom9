const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/auth');

// Get all addresses for a customer (customer_id from req.user)
router.get('/', authenticateToken, addressController.getAddressesByCustomer);
// Get a single address by id
router.get('/:id', authenticateToken, addressController.getAddressById);
// Add a new address
router.post('/', authenticateToken, addressController.addAddress);
// Update an address
router.put('/:id', authenticateToken, addressController.updateAddress);
// Delete an address
router.delete('/:id', authenticateToken, addressController.deleteAddress);

module.exports = router; 