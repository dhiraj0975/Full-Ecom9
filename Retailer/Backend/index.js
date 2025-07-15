require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { testConnection } = require('./Config/Db');
const errorMiddleware = require('./middleware/errorMiddleware');
const retailerRoutes = require('./Routes/retailerRoutes');
const productRoutes = require('./Routes/productRoutes');
const subcategoriesRouter = require('./Routes/subcategoryRoutes');
const orderRouter = require('./Routes/orderRoutes');
const customerRoutes = require('./Routes/customerRoutes');
const customerAddressRoutes = require('./Routes/customerAddressRoutes');

// const customerRoutes = require('./Routes/customerRoutes');




const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174',"http://localhost:5175"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Test database connection on startup
testConnection();

// API routes
app.use('/api/retailers', retailerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api/orders', orderRouter);
app.use('/api/customers', customerRoutes);
app.use('/api/customer-addresses', customerAddressRoutes);


// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Retailer API' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Retailer Server is running on port ${PORT}`);
});
