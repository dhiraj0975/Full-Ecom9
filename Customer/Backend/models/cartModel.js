const { pool } = require('../config/db');

exports.findCartItem = (customer_id, product_id) => {
  return pool.query(
    'SELECT * FROM cart_items WHERE customer_id = ? AND product_id = ? AND status = "active"',
    [customer_id, product_id]
  );
};

exports.updateCartItemQty = (quantity, id) => {
  return pool.query(
    'UPDATE cart_items SET quantity = quantity + ? WHERE id = ?',
    [quantity, id]
  );
};

exports.insertCartItem = (customer_id, product_id, quantity, price) => {
  return pool.query(
    'INSERT INTO cart_items (customer_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
    [customer_id, product_id, quantity, price]
  );
};

exports.getCartItems = (customer_id) => {
  return pool.query(
    `SELECT ci.*, p.name, p.image_url, p.quantity AS product_quantity
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.customer_id = ? AND ci.status = "active"`,
    [customer_id]
  );
};

exports.removeCartItem = (id) => {
  return pool.query(
    'UPDATE cart_items SET status = "inactive" WHERE id = ?',
    [id]
  );
};

exports.setCartItemQty = (quantity, id) => {
  return pool.query(
    'UPDATE cart_items SET quantity = ? WHERE id = ?',
    [quantity, id]
  );
};

exports.clearCart = (customer_id) => {
  return pool.query(
    'UPDATE cart_items SET status = "inactive" WHERE customer_id = ? AND status = "active"',
    [customer_id]
  );
}; 