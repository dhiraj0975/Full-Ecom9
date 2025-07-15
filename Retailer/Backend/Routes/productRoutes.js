const express = require('express');
const productRoutes = express.Router();
const { 
  createProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  getMyProducts,
  getMyProductCount
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

// Get all products - Public access
productRoutes.get('/', getAllProducts);

// Get product by ID - Public access  
productRoutes.get('/:id', getProductById);

// ========================================
// PROTECTED ROUTES (Authentication required)
// ========================================

// Retailer-specific routes (must be before /:id routes)
productRoutes.get('/my/products', authMiddleware, getMyProducts);
productRoutes.get('/my/stats', authMiddleware, getMyProductCount);

// Product CRUD operations - Only for product owners
productRoutes.post('/', authMiddleware, createProduct);
productRoutes.put('/:id', authMiddleware, updateProduct);
productRoutes.delete('/:id', authMiddleware, deleteProduct);

module.exports = productRoutes;