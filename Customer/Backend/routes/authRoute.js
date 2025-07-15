const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { sendOTPEmail } = require('../controllers/emailController');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', sendOTPEmail);
router.post('/verify-otp-reset', authController.verifyOTPAndResetPassword);

// Mobile OTP routes
router.post('/generate-mobile-otp', authController.generateMobileOTP);
router.post('/verify-mobile-otp', authController.verifyMobileOTP);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/profile/change-password', authenticateToken, authController.changePassword);

// Admin routes (for getting all customers and managing states)
router.get('/all', authenticateToken, authController.getAllCustomers);
router.put('/:id/state', authenticateToken, authController.updateCustomerState);

module.exports = router;  