const { pool } = require("../Config/Db");

// Create category
const createCategory = async (name, img_url) => {
  const [result] = await pool.query(
    "INSERT INTO categories (name, img_url) VALUES (?, ?)",
    [name, img_url]
  );
  return result;
};

// Get all categories
const getAllCategories = async () => {
  const [rows] = await pool.query("SELECT * FROM categories");
  return rows;
};

// Get category by ID
const getCategoryById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [id]);
  return rows[0];
};

// Update category
const updateCategory = async (id, name, img_url) => {
  const [result] = await pool.query(
    "UPDATE categories SET name = ?, img_url = ? WHERE id = ?",
    [name, img_url, id]
  );
  return result;
};

// Delete category
const deleteCategory = async (id) => {
  const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [id]);
  return result;
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
