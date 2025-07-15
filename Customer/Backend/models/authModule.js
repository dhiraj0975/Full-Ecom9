const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class Customer {
  // Register
  static async register({ name, email, phone = null, password }) {
    try {
      const [exists] = await pool.execute('SELECT id FROM customers WHERE email = ?', [email]);
      if (exists.length) throw new Error('Email already registered');

      const hashed = await bcrypt.hash(password, 10);
      const [result] = await pool.execute(
        'INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)',
        [name, email, phone, hashed]
      );

      return { id: result.insertId, name, email, phone };
    } catch (err) { throw err; }
  }

  // Login
  static async login(email, password) {
    try {
      const [rows] = await pool.execute('SELECT * FROM customers WHERE email = ?', [email]);
      if (!rows.length) throw new Error('Invalid email or password');

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid email or password');

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      delete user.password;
      return { customer: user, token };
    } catch (err) { throw err; }
  }

  // Get by ID
  static async getById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, email, phone, created_at FROM customers WHERE id = ?',
        [id]
      );
      if (!rows.length) throw new Error('Customer not found');
      return rows[0];
    } catch (err) { throw err; }
  }

  // Update Profile
  static async updateProfile(id, { name, phone = null }) {
    try {
      const [result] = await pool.execute(
        'UPDATE customers SET name = ?, phone = ? WHERE id = ?',
        [name, phone, id]
      );
      if (!result.affectedRows) throw new Error('Customer not found or no changes made');
      return { message: 'Profile updated successfully' };
    } catch (err) { throw err; }
  }

  // Change Password
  static async changePassword(id, currentPassword, newPassword) {
    try {
      const [rows] = await pool.execute('SELECT password FROM customers WHERE id = ?', [id]);
      if (!rows.length) throw new Error('Customer not found');

      const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isMatch) throw new Error('Current password is incorrect');

      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.execute('UPDATE customers SET password = ? WHERE id = ?', [hashed, id]);

      return { message: 'Password changed successfully' };
    } catch (err) { throw err; }
  }

  // Get All Customers
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, email, phone, created_at FROM customers ORDER BY created_at DESC'
      );
      return rows;
    } catch (err) { throw err; }
  }

  // Reset Password by Email (for OTP verification)
  static async resetPasswordByEmail(email, newPassword) {
    try {
      // Check if user exists
      const [rows] = await pool.execute('SELECT id FROM customers WHERE email = ?', [email]);
      if (!rows.length) throw new Error('Customer not found');

      // Hash new password
      const hashed = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await pool.execute('UPDATE customers SET password = ? WHERE email = ?', [hashed, email]);

      return { message: 'Password reset successfully' };
    } catch (err) { throw err; }
  }

  // Update State (not used if "state" column removed)
  static async updateState() {
    throw new Error('State update not available — "state" column missing in table');
  }

  // Activate account by email (for mobile verification)
  static async activateAccountByEmail(email) {
    try {
      // Check if user exists
      const [rows] = await pool.execute('SELECT * FROM customers WHERE email = ?', [email]);
      if (!rows.length) throw new Error('Customer not found');

      const customer = rows[0];
      
      // In a real app, you might have an 'is_verified' or 'status' column
      // For now, we'll just return the customer data
      // You can add: UPDATE customers SET is_verified = 1 WHERE email = ?
      
      delete customer.password;
      return customer;
    } catch (err) { throw err; }
  }

  // Generate JWT token
  static async generateToken(customerId) {
    try {
      const [rows] = await pool.execute('SELECT id, email, name FROM customers WHERE id = ?', [customerId]);
      if (!rows.length) throw new Error('Customer not found');

      const user = rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
      );

      return token;
    } catch (err) { throw err; }
  }
}

module.exports = Customer;
Customer.pool = pool;
