const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

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

module.exports = router; 