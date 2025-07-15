const express = require('express');
const customerRoutes = express.Router();
const {
  createCustomerHandler,
  getAllCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  hardDeleteCustomerHandler,
  restoreCustomerHandler,
  getCustomerStatsHandler,
  getCustomersWithOrders
} = require('../controllers/customerController');

const authMiddleware = require('../middleware/authMiddleware');

// POST /api/customers - Create new customer
customerRoutes.post('/', createCustomerHandler);

console.log('getCustomerStatsHandler:', typeof getCustomerStatsHandler);
// GET /api/customers/stats - Get customer statistics
customerRoutes.get('/stats', getCustomerStatsHandler);

console.log('getCustomersWithOrders:', typeof getCustomersWithOrders);
// GET /api/customers/with-orders - Get customers who have ordered retailer's products
customerRoutes.get('/with-orders', authMiddleware, getCustomersWithOrders);

console.log('getAllCustomersHandler:', typeof getAllCustomersHandler);
// GET /api/customers - Get all customers with pagination and search
customerRoutes.get('/', getAllCustomersHandler);

console.log('getCustomerByIdHandler:', typeof getCustomerByIdHandler);
// GET /api/customers/:id - Get customer by ID
customerRoutes.get('/:id', getCustomerByIdHandler);

// PUT /api/customers/:id - Update customer by ID
customerRoutes.put('/:id', updateCustomerHandler);

// DELETE /api/customers/:id - Soft delete customer by ID
customerRoutes.delete('/:id', deleteCustomerHandler);

// DELETE /api/customers/:id/hard - Hard delete customer by ID (admin only)
customerRoutes.delete('/:id/hard', hardDeleteCustomerHandler);

// PATCH /api/customers/:id/restore - Restore soft deleted customer
customerRoutes.patch('/:id/restore', restoreCustomerHandler);

module.exports = customerRoutes; 