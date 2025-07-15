const express = require('express');
const subcategoriesRouter = express.Router();
const { fetchAllSubcategories } = require('../controllers/subcategoryController');

// GET /api/subcategories
subcategoriesRouter.get('/', fetchAllSubcategories);

module.exports = subcategoriesRouter; 