const { pool } = require('../config/db');
const getAllCategories = require('../models/categoryModule')

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    console.log('🔍 Attempting to fetch categories...');
    console.log('Database config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
    
    const [categories] = await pool.query('SELECT * FROM categories');
    console.log(`✅ Successfully fetched ${categories.length} categories`);
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('❌ Category fetch error:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories', 
      error: {
        message: error.message,
        code: error.code
      }
    });
  }
}; 