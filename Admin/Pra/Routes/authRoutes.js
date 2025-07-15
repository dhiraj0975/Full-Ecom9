const express = require('express');
const authRoutes = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const userController = require('../controllers/userController');
const { assignRole } = require('../controllers/userRoleController');
const { globalSearch } = require('../controllers/globalSearchController');


// Public routes
authRoutes.post('/register',auth,isAdmin, authController.register,assignRole);
authRoutes.post('/login',authController.login);
authRoutes.post('/logout',authController.logout);
authRoutes.post('/forgot-password', authController.forgotPassword);
authRoutes.post('/verify-otp', authController.verifyOTP);
authRoutes.post('/reset-password', authController.resetPassword);


// Protected routes
authRoutes.get('/me', auth, authController.getCurrentUser);
authRoutes.get('/global-search', globalSearch);

module.exports = authRoutes;