const { pool } = require('../config/db');

// Get all categories
async function getAllCategories() {
  const [rows] = await pool.query('SELECT * FROM categories');
  return rows;
}

// Create a new category
async function createCategory(name) {
  const [result] = await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
  return result.insertId;
}

// Update a category
async function updateCategory(id, name) {
  const [result] = await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result.affectedRows;
}

// Delete a category
async function deleteCategory(id) {
  const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}; 