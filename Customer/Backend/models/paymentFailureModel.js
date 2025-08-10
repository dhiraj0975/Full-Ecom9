const { pool } = require('../config/db');

const PaymentFailure = {
  create: (data, callback) => {
    const sql = `INSERT INTO payment_failures 
                 (customer_id, amount, payment_method, failure_reason, failure_code, 
                  error_message, upi_id, card_last4, transaction_id, razorpay_payment_id, 
                  razorpay_order_id, failure_type, user_agent, ip_address, cart_items, 
                  total_items, delivery_charge, discount)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      data.customer_id,
      data.amount,
      data.payment_method,
      data.failure_reason || null,
      data.failure_code || null,
      data.error_message || null,
      data.upi_id || null,
      data.card_last4 || null,
      data.transaction_id || null,
      data.razorpay_payment_id || null,
      data.razorpay_order_id || null,
      data.failure_type || 'other',
      data.user_agent || null,
      data.ip_address || null,
      JSON.stringify(data.cart_items) || null,
      data.total_items || 0,
      data.delivery_charge || 0,
      data.discount || 0
    ];
    
    pool.query(sql, values)
      .then(([result]) => callback(null, result))
      .catch(err => callback(err));
  },

  getByCustomer: (customerId, callback) => {
    const sql = `SELECT * FROM payment_failures 
                 WHERE customer_id = ? 
                 ORDER BY failed_at DESC`;
    pool.query(sql, [customerId])
      .then(([rows]) => callback(null, rows))
      .catch(err => callback(err));
  },

  getFailureStats: (callback) => {
    const sql = `SELECT 
                   failure_type,
                   payment_method,
                   COUNT(*) as count,
                   SUM(amount) as total_amount,
                   DATE(failed_at) as failure_date
                 FROM payment_failures 
                 WHERE failed_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                 GROUP BY failure_type, payment_method, DATE(failed_at)
                 ORDER BY failed_at DESC`;
    pool.query(sql)
      .then(([rows]) => callback(null, rows))
      .catch(err => callback(err));
  }
};

module.exports = PaymentFailure;