// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { testConnection } = require('./config/db');
const { verifyConnection } = require('./config/email');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGIN
    : 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

// Middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));



// Test database connection
const testDB = async () => {
  try {
    const connected = await testConnection();
    if (connected) console.log('✅ Database connected successfully');
    else console.warn('❌ Database connection failed');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
};

// Test email connection
const testEmail = async () => {
  try {
    const connected = await verifyConnection();
    if (connected) console.log('✅ Email server connected successfully');
    else console.warn('❌ Email server connection failed');
  } catch (error) {
    console.error('❌ Email server connection error:', error);
  }
};

// Routes
app.use('/api/customers', require('./routes/authRoute'));
app.use('/api/email', require('./routes/emailRoute'));
app.use('/api/categories', require('./routes/categoryRoute'));
app.use('/api/subcategories', require('./routes/subcategoryRoute'));
app.use('/api/products', require('./routes/productRoute'));
app.use('/api/cart', require('./routes/cartRoute'));
app.use('/api/addresses', require('./routes/addressRoute'));
app.use('/api/payments', require('./routes/paymentRoute'));
app.use('/api/orders', require('./routes/orderRoute'));
app.use('/api/order-items', require('./routes/orderItemRoute'));
app.use('/api/test', require('./routes/testRoute'));

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: '🚀 Customer Management API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: '❌ Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
  testDB();
  testEmail();
});
