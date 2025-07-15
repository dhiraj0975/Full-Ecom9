const { pool } = require('../Config/Db');

// Create new address
async function createAddress(addressData) {
  const { customer_id, name, phone, address_line, city, state, country, pincode, is_default } = addressData;
  // If is_default is true, unset previous default
  if (is_default) {
    await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [customer_id]);
  }
  const query = `
    INSERT INTO customer_addresses (customer_id, name, phone, address_line, city, state, country, pincode, is_default, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;
  const [result] = await pool.query(query, [customer_id, name, phone, address_line, city, state, country, pincode, is_default ? 1 : 0]);
  return result.insertId;
}

// Get all addresses for a customer
async function getAddressesByCustomerId(customer_id) {
  const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE customer_id = ? ORDER BY is_default DESC, created_at DESC', [customer_id]);
  return rows;
}

// Get address by id
async function getAddressById(id) {
  const [rows] = await pool.query('SELECT * FROM customer_addresses WHERE id = ?', [id]);
  return rows[0];
}

// Update address
async function updateAddress(id, addressData) {
  const { name, phone, address_line, city, state, country, pincode, is_default } = addressData;
  // If is_default is true, unset previous default
  if (is_default) {
    const [row] = await pool.query('SELECT customer_id FROM customer_addresses WHERE id = ?', [id]);
    if (row.length > 0) {
      await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [row[0].customer_id]);
    }
  }
  const query = `
    UPDATE customer_addresses SET name = ?, phone = ?, address_line = ?, city = ?, state = ?, country = ?, pincode = ?, is_default = ?, updated_at = NOW()
    WHERE id = ?
  `;
  const [result] = await pool.query(query, [name, phone, address_line, city, state, country, pincode, is_default ? 1 : 0, id]);
  return result.affectedRows > 0;
}

// Delete address
async function deleteAddress(id) {
  const [result] = await pool.query('DELETE FROM customer_addresses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

// Set default address
async function setDefaultAddress(id) {
  // Get customer_id for this address
  const [rows] = await pool.query('SELECT customer_id FROM customer_addresses WHERE id = ?', [id]);
  if (rows.length === 0) return false;
  const customer_id = rows[0].customer_id;
  await pool.query('UPDATE customer_addresses SET is_default = 0 WHERE customer_id = ?', [customer_id]);
  const [result] = await pool.query('UPDATE customer_addresses SET is_default = 1 WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createAddress,
  getAddressesByCustomerId,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress
}; 