// Test Railway MySQL Database Connection
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testRailwayConnection() {
  console.log('🔍 Testing Railway MySQL Connection...\n');
  
  // Display connection details (without password)
  console.log('Connection Details:');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT || 3306}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

  try {
    // Create connection pool
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      acquireTimeout: 60000,
      timeout: 60000
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Database connection successful!');
    
    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows[0]);
    
    // Check if tables exist
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, [process.env.DB_NAME]);
    
    console.log('\n📋 Existing tables:');
    if (tables.length === 0) {
      console.log('❌ No tables found. Please run the setup-database.sql script first.');
    } else {
      tables.forEach(table => {
        console.log(`   - ${table.TABLE_NAME}`);
      });
    }
    
    connection.release();
    await pool.end();
    
    console.log('\n🎉 Railway MySQL connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your .env file has correct Railway credentials');
    console.log('2. Verify Railway MySQL service is running');
    console.log('3. Check if your IP is whitelisted in Railway');
    console.log('4. Ensure database name exists in Railway');
    console.log('5. Verify SSL settings for production environment');
  }
}

// Run the test
testRailwayConnection(); 