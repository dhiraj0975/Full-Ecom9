const express = require('express');
const router = express.Router();
const { getSubcategoriesByCategory } = require('../controllers/subcategoryController');

// GET /api/subcategories/:categoryId
router.get('/:categoryId', getSubcategoriesByCategory);

module.exports = router; 