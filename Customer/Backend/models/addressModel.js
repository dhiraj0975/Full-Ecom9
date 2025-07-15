const { pool } = require('../config/db');

// Get all addresses for a customer
async function getAddressesByCustomer(customer_id) {
  const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ?', [customer_id]);
  return rows;
}

// Get a single address by id
async function getAddressById(id) {
  const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE id = ?', [id]);
  return rows[0] || null;
}

// Add a new address
async function addAddress(address) {
  const { customer_id, name, phone, address_line, city, state, country, pincode, is_default } = address;
  const [result] = await pool.query(
    'INSERT INTO customer_addresses (customer_id, name, phone, address_line, city, state, country, pincode, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [customer_id, name, phone, address_line, city, state, country, pincode, is_default || 0]
  );
  return result.insertId;
}

// Update an address
async function updateAddress(id, address) {
  const { name, phone, address_line, city, state, country, pincode, is_default } = address;
  const [result] = await pool.query(
    'UPDATE customer_addresses SET name=?, phone=?, address_line=?, city=?, state=?, country=?, pincode=?, is_default=? WHERE id=?',
    [name, phone, address_line, city, state, country, pincode, is_default || 0, id]
  );
  return result.affectedRows;
}

// Delete an address
async function deleteAddress(id) {
  const [result] = await pool.query('DELETE FROM customer_addresses WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = {
  getAddressesByCustomer,
  getAddressById,
  addAddress,
  updateAddress,
  deleteAddress,
}; 