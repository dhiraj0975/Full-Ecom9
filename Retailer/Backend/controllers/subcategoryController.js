const { getAllSubcategories } = require('../models/subcategoryModel');

async function fetchAllSubcategories(req, res) {
  try {
    const subcategories = await getAllSubcategories();
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subcategories' });
  }
}

module.exports = { fetchAllSubcategories }; 