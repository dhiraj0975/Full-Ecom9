const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile, 
  getBankDetails,
  updateBankDetails, 
  deleteRetailer 
} = require('../controllers/retailerController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/profile', authMiddleware, getProfile);                    // Get retailer profile
router.put('/profile', authMiddleware, updateProfile);                 // Update retailer profile (legacy)
router.get('/bank-details', authMiddleware, getBankDetails);           // Get bank details
router.put('/bank-details', authMiddleware, updateBankDetails);        // Update bank details
router.delete('/delete/:id', authMiddleware, deleteRetailer);

// Note: We will add more protected routes and other retailer routes later.

module.exports = router;  