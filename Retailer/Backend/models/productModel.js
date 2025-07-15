const { pool } = require('../Config/Db');

// Create Product
async function addProduct({ name, price, quantity, subcategory_id, image_url, status, description, retailer_id }) {
  const [result] = await pool.query(
    'INSERT INTO products (name, price, quantity, subcategory_id, image_url, status, description, retailer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, price, quantity, subcategory_id, image_url, status, description, retailer_id]
  );
  
  return result.insertId;
}

// Get All Products (Public)
async function getAllProducts() {
  const query = `
    SELECT p.*, r.name as retailer_name, sc.name as subcategory_name
    FROM products p 
    JOIN retailers r ON p.retailer_id = r.id 
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE p.status = 'available'
    ORDER BY p.created_at DESC
  `;
  const [rows] = await pool.query(query);
  return rows;
}

// Get Product By ID (Public)
async function getProductById(id) {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      COALESCE(r.name, 'Unknown Retailer') as retailer_name,
      sc.name as subcategory_name
    FROM products p 
    LEFT JOIN retailers r ON p.retailer_id = r.id 
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE p.id = ?
  `, [id]);
  return rows[0];
}

// Update Product (Owner only)
async function updateProduct(id, { name, price, quantity, subcategory_id, image_url, status, description }) {
  const [result] = await pool.query(
    `UPDATE products 
     SET name = ?, price = ?, quantity = ?, subcategory_id = ?, 
         image_url = ?, status = ?, description = ?
     WHERE id = ?`,
    [name, price, quantity, subcategory_id, image_url, status, description, id]
  );
  
  return result.affectedRows > 0;
}

// Delete Product (Owner only)
async function deleteProduct(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  
  return result.affectedRows > 0;
}

// Get Products By Retailer (Private)
async function getProductsByRetailer(retailer_id) {
  const [rows] = await pool.query(`
    SELECT 
      p.*,
      COALESCE(r.name, 'Unknown Retailer') as retailer_name,
      sc.name as subcategory_name
    FROM products p 
    LEFT JOIN retailers r ON p.retailer_id = r.id
    LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
    WHERE p.retailer_id = ? 
    ORDER BY p.created_at DESC
  `, [retailer_id]);
  
  return rows;
}

// Check Product Ownership
async function checkProductOwnership(productId, retailerId) {
  const [rows] = await pool.query(
    'SELECT retailer_id FROM products WHERE id = ?',
    [productId]
  );
  
  if (rows.length === 0) {
    return { exists: false, owner: null };
  }
  
  return { 
    exists: true, 
    owner: rows[0].retailer_id,
    isOwner: rows[0].retailer_id === retailerId
  };
}

module.exports = { 
  addProduct, 
  getAllProducts, 
  getProductById, 
  updateProduct, 
  deleteProduct, 
  getProductsByRetailer,
  checkProductOwnership
};