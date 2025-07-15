// Customer controller for handling customer operations
const { 
  createCustomer, 
  findCustomerByEmail, 
  getCustomerById, 
  getAllCustomers,
  updateCustomerById, 
  deleteCustomerById,
  hardDeleteCustomerById,
  restoreCustomerById,
  getCustomerStats,
  getCustomersWithOrdersByRetailer
} = require('../models/customerModel');

// Create new customer
const createCustomerHandler = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Name, email, phone, and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
    }
    const existingCustomer = await findCustomerByEmail(email);
    if (existingCustomer) {
      return res.status(409).json({ message: 'Customer with this email already exists' });
    }
    const customerId = await createCustomer({ name, email, phone, password });
    res.status(201).json({ message: 'Customer created successfully', customerId });
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ message: 'Failed to create customer', error: err.message });
  }
};

// Get all customers with pagination and search
const getAllCustomersHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Invalid pagination parameters' });
    }
    const result = await getAllCustomers(page, limit, search);
    res.json({ message: 'Customers retrieved successfully', data: result });
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ message: 'Failed to get customers', error: err.message });
  }
};

// Get customer by ID
const getCustomerByIdHandler = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ message: 'Valid customer ID is required' });
    }
    const customer = await getCustomerById(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer retrieved successfully', customer });
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ message: 'Failed to get customer', error: err.message });
  }
};

// Update customer by ID
const updateCustomerHandler = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const { name, email, phone, password } = req.body;
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ message: 'Valid customer ID is required' });
    }
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Name, email, phone, and password are required' });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' });
    }
    const existingCustomer = await findCustomerByEmail(email);
    if (existingCustomer && existingCustomer.id !== customerId) {
      return res.status(409).json({ message: 'Email is already taken by another customer' });
    }
    const updated = await updateCustomerById(customerId, { name, email, phone, password });
    if (updated) {
      res.json({ message: 'Customer updated successfully' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ message: 'Failed to update customer', error: err.message });
  }
};

// Soft delete customer by ID
const deleteCustomerHandler = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ message: 'Valid customer ID is required' });
    }
    const deleted = await deleteCustomerById(customerId);
    if (deleted) {
      res.json({ message: 'Customer deleted successfully' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ message: 'Failed to delete customer', error: err.message });
  }
};

// Hard delete customer by ID (admin only)
const hardDeleteCustomerHandler = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ message: 'Valid customer ID is required' });
    }
    const deleted = await hardDeleteCustomerById(customerId);
    if (deleted) {
      res.json({ message: 'Customer permanently deleted' });
    } else {
      res.status(404).json({ message: 'Customer not found' });
    }
  } catch (err) {
    console.error('Hard delete customer error:', err);
    res.status(500).json({ message: 'Failed to delete customer', error: err.message });
  }
};

// Restore soft deleted customer
const restoreCustomerHandler = async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    if (!customerId || isNaN(customerId)) {
      return res.status(400).json({ message: 'Valid customer ID is required' });
    }
    const restored = await restoreCustomerById(customerId);
    if (restored) {
      res.json({ message: 'Customer restored successfully' });
    } else {
      res.status(404).json({ message: 'Customer not found or already active' });
    }
  } catch (err) {
    console.error('Restore customer error:', err);
    res.status(500).json({ message: 'Failed to restore customer', error: err.message });
  }
};

// Get customer statistics
const getCustomerStatsHandler = async (req, res) => {
  try {
    const stats = await getCustomerStats();
    res.json({ message: 'Customer statistics retrieved successfully', stats });
  } catch (err) {
    console.error('Get customer stats error:', err);
    res.status(500).json({ message: 'Failed to get customer statistics', error: err.message });
  }
};

// Get customers with orders for this retailer
const getCustomersWithOrders = async (req, res) => {
  try {
    const retailerId = req.user?.id || 1; // Get retailer ID from auth (or use 1 for test)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const customers = await getCustomersWithOrdersByRetailer(retailerId, page, limit, search);
    console.log('RetailerId:', retailerId);
    console.log('Customers with orders:', customers);
    res.json({ customers });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get customers with orders', error: err.message });
  }
};

console.log('getAllCustomersHandler:', getAllCustomersHandler);
module.exports = {
  createCustomerHandler,
  getAllCustomersHandler,
  getCustomerByIdHandler,
  updateCustomerHandler,
  deleteCustomerHandler,
  hardDeleteCustomerHandler,
  restoreCustomerHandler,
  getCustomerStatsHandler,
  getCustomersWithOrders
}; 