const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// Test database connection
router.get('/db-test', async (req, res) => {
  try {
    console.log('🔍 Testing database connection...');
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful');
    
    // Test simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', result[0]);
    
    connection.release();
    
    res.json({ 
      success: true, 
      message: 'Database connection successful',
      test: result[0]
    });
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection failed',
      error: {
        message: error.message,
        code: error.code
      }
    });
  }
});

// Test authentication
router.get('/auth-test', authenticateToken, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Authentication successful',
    user: req.user
  });
});

// Test cookies
router.get('/cookie-test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Cookie test',
    cookies: req.cookies,
    headers: {
      authorization: req.headers.authorization,
      cookie: req.headers.cookie
    }
  });
});

module.exports = router; 