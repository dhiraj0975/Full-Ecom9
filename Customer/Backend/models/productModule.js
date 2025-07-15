const { pool } = require('../config/db');

async function getAllProducts() {
  const [rows] = await pool.query('SELECT * FROM products WHERE status = "available"');
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
  return rows[0] || null;
}

async function createProduct(product) {
  const { name, price, quantity, subcategory_id, image_url, status, description, retailer_id } = product;
  const [result] = await pool.query(
    'INSERT INTO products (name, price, quantity, subcategory_id, image_url, status, description, retailer_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [name, price, quantity, subcategory_id, image_url, status, description, retailer_id]
  );
  return result.insertId;
}

async function updateProduct(id, product) {
  const { name, price, quantity, subcategory_id, image_url, status, description, retailer_id } = product;
  const [result] = await pool.query(
    'UPDATE products SET name=?, price=?, quantity=?, subcategory_id=?, image_url=?, status=?, description=?, retailer_id=? WHERE id=?',
    [name, price, quantity, subcategory_id, image_url, status, description, retailer_id, id]
  );
  return result.affectedRows;
}

async function deleteProduct(id) {
  const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows;
}

// New function to update product quantity (deduct from stock)
async function updateProductQuantity(productId, quantityToDeduct) {
  try {
    // First check current quantity
    const [currentProduct] = await pool.query('SELECT quantity FROM products WHERE id = ?', [productId]);
    
    if (currentProduct.length === 0) {
      throw new Error('Product not found');
    }
    
    const currentQuantity = currentProduct[0].quantity;
    const newQuantity = currentQuantity - quantityToDeduct;
    
    if (newQuantity < 0) {
      throw new Error('Insufficient stock');
    }
    
    // Update the quantity
    const [result] = await pool.query(
      'UPDATE products SET quantity = ? WHERE id = ?',
      [newQuantity, productId]
    );
    
    return result.affectedRows;
  } catch (error) {
    throw error;
  }
}

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, updateProductQuantity }; 