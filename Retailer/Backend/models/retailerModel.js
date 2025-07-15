// This file will contain the database model for the retailer.
// We will define the schema for the 'retailers' table here.

const { pool } = require('../Config/Db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register new retailer
async function createRetailer(retailerData) {
  const { name, email, password, phone, address, business_name } = retailerData;
  
  const query = `
    INSERT INTO retailers (name, email, password, phone, address, business_name) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await pool.query(query, [name, email, password, phone, address, business_name]);
  return result.insertId;
}

// Find retailer by email
async function findRetailerByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM retailers WHERE email = ?', [email]);
  return rows[0];
}

// Login logic
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const retailer = await findRetailerByEmail(email);
    if (!retailer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, retailer.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: retailer.id, email: retailer.email, status: retailer.status },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      retailer: {
        id: retailer.id,
        name: retailer.name,
        email: retailer.email,
        phone: retailer.phone,
        address: retailer.address,
        business_name: retailer.business_name,
        status: retailer.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// Update retailer by ID
async function updateRetailerById(id, updateData) {
  const { name, phone, address, business_name } = updateData;
  
  const query = `
    UPDATE retailers 
    SET name = ?, phone = ?, address = ?, business_name = ?
    WHERE id = ?
  `;
  
  const [result] = await pool.query(query, [
    name, phone, address, business_name, id
  ]);
  
  return result.affectedRows > 0;
}

// Get retailer by ID
async function getRetailerById(id) {
  const [rows] = await pool.query('SELECT * FROM retailers WHERE id = ?', [id]);
  return rows[0];
}

// Delete retailer by ID
async function deleteRetailerById(id) {
  const [result] = await pool.query('DELETE FROM retailers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createRetailer,
  findRetailerByEmail,
  updateRetailerById,
  getRetailerById,
  deleteRetailerById,
  login
}; 