const { pool } = require('../config/db');

// Get all subcategories for a category
async function getSubcategoriesByCategory(categoryId) {
  const [rows] = await pool.query('SELECT * FROM subcategories WHERE category_id = ?', [categoryId]);
  return rows;
}

module.exports = {
  getSubcategoriesByCategory,
}; 