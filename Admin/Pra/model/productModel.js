// 📁 model/productModel.js
const { pool } = require("../Config/Db");

const Product = {
  // ✅ CREATE Product
  create: async (data) => {
    const { name, price, quantity, subcategory_id, description, image_url, status, retailer_id } = data;

    if (!name || !price || !quantity || !subcategory_id || !image_url || !status || !retailer_id) {
      throw new Error("All fields including subcategory_id and retailer_id are required");
    }

    const [result] = await pool.query(
      `INSERT INTO products 
       (name, price, quantity, subcategory_id, description, image_url, status, retailer_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, price, quantity, subcategory_id, description, image_url, status, retailer_id]
    );

    return result;
  },

  // ✅ GET All Products (with Subcategory Name)
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT 
  p.*, 
  s.name AS subcategory_name,
  r.name AS retailer_name
FROM 
  products p
LEFT JOIN 
  subcategories s ON p.subcategory_id = s.id
LEFT JOIN 
  retailers r ON p.retailer_id = r.id
ORDER BY 
  p.id DESC;

    `);
    return rows;
  },

  // ✅ GET Product by ID
  getById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM products WHERE id = ?", [id]);
    return rows[0];
  },

  // ✅ UPDATE Product
  update: async (id, data) => {
    const { name, price, quantity, subcategory_id, description, image_url, status, retailer_id } = data;

    if (!name || !price || !quantity || !subcategory_id || !description || !image_url || !status || !retailer_id) {
      throw new Error("All fields including subcategory_id and retailer_id are required");
    }

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, price = ?, quantity = ?, subcategory_id = ?, description = ?, image_url = ?, status = ?, retailer_id = ?
       WHERE id = ?`,
      [name, price, quantity, subcategory_id, description, image_url, status, retailer_id, id]
    );

    return result;
  },

  // ✅ DELETE Product
  delete: async (id) => {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [id]);
    return result;
  },
};

module.exports = Product;
