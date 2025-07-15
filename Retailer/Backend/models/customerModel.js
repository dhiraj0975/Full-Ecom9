// Customer model for database operations
const { pool } = require('../Config/Db');

// Create new customer
async function createCustomer(customerData) {
  const { name, email, phone, password } = customerData;
  const query = `
    INSERT INTO customers (name, email, phone, password, created_at) 
    VALUES (?, ?, ?, ?, NOW())
  `;
  const [result] = await pool.query(query, [name, email, phone, password]);
  return result.insertId;
}

// Find customer by email
async function findCustomerByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE email = ? AND deleted_at IS NULL', [email]);
  return rows[0];
}

// Get customer by ID
async function getCustomerById(id) {
  const [rows] = await pool.query('SELECT * FROM customers WHERE id = ? AND deleted_at IS NULL', [id]);
  return rows[0];
}

// Get all customers with pagination
async function getAllCustomers(page = 1, limit = 10, search = '') {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM customers WHERE deleted_at IS NULL';
  let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL';
  let params = [];
  let countParams = [];
  if (search) {
    query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    countQuery += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params = [searchTerm, searchTerm, searchTerm];
    countParams = [searchTerm, searchTerm, searchTerm];
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const [rows] = await pool.query(query, params);
  const [countResult] = await pool.query(countQuery, countParams);
  return {
    customers: rows,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit)
  };
}

// Update customer by ID
async function updateCustomerById(id, updateData) {
  const { name, email, phone, password } = updateData;
  const query = `
    UPDATE customers 
    SET name = ?, email = ?, phone = ?, password = ?, updated_at = NOW()
    WHERE id = ? AND deleted_at IS NULL
  `;
  const [result] = await pool.query(query, [name, email, phone, password, id]);
  return result.affectedRows > 0;
}

// Soft delete customer by ID
async function deleteCustomerById(id) {
  const [result] = await pool.query(
    'UPDATE customers SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL', 
    [id]
  );
  return result.affectedRows > 0;
}

// Hard delete customer by ID (for admin use)
async function hardDeleteCustomerById(id) {
  const [result] = await pool.query('DELETE FROM customers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Restore soft deleted customer
async function restoreCustomerById(id) {
  const [result] = await pool.query(
    'UPDATE customers SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL', 
    [id]
  );
  return result.affectedRows > 0;
}

// Get customer statistics
async function getCustomerStats() {
  const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM customers WHERE deleted_at IS NULL');
  const [activeResult] = await pool.query('SELECT COUNT(*) as active FROM customers WHERE deleted_at IS NULL');
  const [deletedResult] = await pool.query('SELECT COUNT(*) as deleted FROM customers WHERE deleted_at IS NOT NULL');
  return {
    total: totalResult[0].total,
    active: activeResult[0].active,
    deleted: deletedResult[0].deleted
  };
}

// Get customers who have ordered retailer's products
async function getCustomersWithOrdersByRetailer(retailerId, page = 1, limit = 10, search = '') {
  const offset = (page - 1) * limit;
  let query = `
    SELECT c.*, COUNT(DISTINCT o.id) as orderCount, MAX(o.placed_at) as lastOrderDate
    FROM customers c
    JOIN orders o ON c.id = o.customer_id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE p.retailer_id = ?
      AND c.deleted_at IS NULL
  `;
  let params = [retailerId];
  if (search) {
    query += ' AND (c.name LIKE ? OR c.email LIKE ? OR c.phone LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  query += ' GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  const [rows] = await pool.query(query, params);
  return rows;
}

module.exports = {
  createCustomer,
  findCustomerByEmail,
  getCustomerById,
  getAllCustomers,
  updateCustomerById,
  deleteCustomerById,
  hardDeleteCustomerById,
  restoreCustomerById,
  getCustomerStats,
  getCustomersWithOrdersByRetailer
}; 