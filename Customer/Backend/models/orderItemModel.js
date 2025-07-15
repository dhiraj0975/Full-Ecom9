const { pool } = require('../config/db');

const OrderItem = {
  create: (data, callback) => {
    const sql = `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`;
    const values = [
      data.order_id,
      data.product_id,
      data.quantity,
      data.price
    ];
    pool.query(sql, values)
      .then(([result]) => callback(null, result))
      .catch(err => callback(err));
  },
  // Add more methods as needed
};

// Export pool for use in controller
OrderItem.pool = pool;

module.exports = OrderItem; 