const { pool } = require("../Config/Db");

const Subcategory = {
  getAll: async () => {
    const [rows] = await pool.query("SELECT * FROM subcategories");
    return rows;
  },

  getByCategoryId: async (categoryId) => {
    const [rows] = await pool.query(
      "SELECT * FROM subcategories WHERE category_id = ?",
      [categoryId]
    );
    return rows;
  },

  create: async (name, categoryId) => {
    const [result] = await pool.query(
      "INSERT INTO subcategories (name, category_id) VALUES (?, ?)",
      [name, categoryId]
    );
    return result.insertId;
  },

  update: async (id, name, categoryId) => {
    await pool.query(
      "UPDATE subcategories SET name = ?, category_id = ? WHERE id = ?",
      [name, categoryId, id]
    );
  },

  delete: async (id) => {
    await pool.query("DELETE FROM subcategories WHERE id = ?", [id]);
  },
};

module.exports = Subcategory;
