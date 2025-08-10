const express = require('express');
const router = express.Router();
const paymentFailureController = require('../controllers/paymentFailureController');

// Payment failure routes
router.post('/payment-failures', paymentFailureController.recordPaymentFailure);
router.get('/payment-failures/customer/:customerId', paymentFailureController.getCustomerFailures);
router.get('/payment-failures/stats', paymentFailureController.getFailureStats);

module.exports = router;