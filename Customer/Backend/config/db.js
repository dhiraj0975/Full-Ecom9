// setup MYSQL DB connection
const mysql = require("mysql2/promise");

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Customer Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Customer Database connection failed:', error);
    return false;
  }
};

module.exports = { pool, testConnection };
