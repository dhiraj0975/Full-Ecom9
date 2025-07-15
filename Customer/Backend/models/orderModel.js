const { pool } = require('../config/db');

const Order = {
  create: (data, callback) => {
    const sql = `INSERT INTO orders (customer_id, address_id, payment_id, order_status, total_amount, delivery_charge, discount, payment_method, placed_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.customer_id,
      data.address_id,
      data.payment_id || null,
      data.order_status || 'pending',
      data.total_amount,
      data.delivery_charge || 0,
      data.discount || 0,
      data.payment_method || null
    ];
    pool.query(sql, values)
      .then(([result]) => callback(null, result))
      .catch(err => callback(err));
  },
  
  // Get all orders
  getAll: (callback) => {
    const sql = 'SELECT * FROM orders ORDER BY placed_at DESC';
    pool.query(sql)
      .then(([rows]) => callback(null, rows))
      .catch(err => callback(err));
  },
  
  // Get order by ID
  getById: (id, callback) => {
    const sql = 'SELECT * FROM orders WHERE id = ?';
    pool.query(sql, [id])
      .then(([rows]) => callback(null, rows[0]))
      .catch(err => callback(err));
  },
  
  // Get orders by customer ID
  getByCustomerId: (customer_id, callback) => {
    const sql = `
      SELECT o.*, 
        (
          SELECT p.image_url 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = o.id 
          LIMIT 1
        ) AS first_product_image_url,
        (
          SELECT p.name
          FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          WHERE oi.order_id = o.id
          LIMIT 1
        ) AS first_product_name,
        (
          SELECT COUNT(*)
          FROM order_items oi
          WHERE oi.order_id = o.id
        ) AS product_count
      FROM orders o 
      WHERE o.customer_id = ? 
      ORDER BY o.placed_at DESC
    `;
    pool.query(sql, [customer_id])
      .then(([rows]) => callback(null, rows))
      .catch(err => callback(err));
  },
};

module.exports = Order;