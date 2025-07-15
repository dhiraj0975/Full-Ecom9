const { pool } = require('../config/db');

const Payment = {
  create: (data, callback) => {
    const sql = `INSERT INTO payments (customer_id, amount, payment_method, payment_status, upi_id, card_last4, transaction_id, order_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      data.customer_id,
      data.amount,
      data.payment_method,
      data.payment_status || 'pending',
      data.upi_id || null,
      data.card_last4 || null,
      data.transaction_id || null,
      data.order_id || null
    ];
    pool.query(sql, values)
      .then(([result]) => callback(null, result))
      .catch(err => callback(err));
  },
  
  update: (id, data, callback) => {
    // Build dynamic SQL query for partial updates
    const updates = [];
    const values = [];
    
    if (data.customer_id !== undefined) {
      updates.push('customer_id = ?');
      values.push(data.customer_id);
    }
    if (data.amount !== undefined) {
      updates.push('amount = ?');
      values.push(data.amount);
    }
    if (data.payment_method !== undefined) {
      updates.push('payment_method = ?');
      values.push(data.payment_method);
    }
    if (data.payment_status !== undefined) {
      updates.push('payment_status = ?');
      values.push(data.payment_status);
    }
    if (data.upi_id !== undefined) {
      updates.push('upi_id = ?');
      values.push(data.upi_id);
    }
    if (data.card_last4 !== undefined) {
      updates.push('card_last4 = ?');
      values.push(data.card_last4);
    }
    if (data.transaction_id !== undefined) {
      updates.push('transaction_id = ?');
      values.push(data.transaction_id);
    }
    if (data.order_id !== undefined) {
      updates.push('order_id = ?');
      values.push(data.order_id);
    }
    
    updates.push('updated_at = NOW()');
    values.push(id);
    
    const sql = `UPDATE payments SET ${updates.join(', ')} WHERE id = ?`;
    
    pool.query(sql, values)
      .then(([result]) => callback(null, result))
      .catch(err => callback(err));
  },
  
  // Get payment by ID
  getById: (id, callback) => {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    pool.query(sql, [id])
      .then(([rows]) => callback(null, rows[0]))
      .catch(err => callback(err));
  },
  
  // Get payments by customer ID
  getByCustomerId: (customer_id, callback) => {
    const sql = 'SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC';
    pool.query(sql, [customer_id])
      .then(([rows]) => callback(null, rows))
      .catch(err => callback(err));
  }
};

module.exports = Payment; 