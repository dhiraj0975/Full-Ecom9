const express = require('express');
const router = express.Router();
const { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendOTPEmail,
  sendCustomEmail, 
  testEmailConnection 
} = require('../controllers/emailController');

// Test email connection
router.get('/test', testEmailConnection);

// Send welcome email
router.post('/welcome', sendWelcomeEmail);

// Send password reset email
router.post('/reset-password', sendPasswordResetEmail);

// Send OTP email with reset button
router.post('/otp', sendOTPEmail);

// Send custom email
router.post('/custom', sendCustomEmail);

module.exports = router; 