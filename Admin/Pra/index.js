require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./Routes/authRoutes');
const userRoleRoutes = require('./Routes/userRoleRoutes');
const userRoutes = require("./Routes/userRoutes")
const { testConnection } = require('./Config/Db');
const roleRoutes = require('./Routes/roleRoutes');
const categoryRoutes = require('./Routes/categoryRoutes');
const SubcategoriesRoutes = require('./Routes/subcategoryRoutes');
const productRoutes = require('./Routes/productRoutes');
const retailerRoutes = require('./Routes/retailerRoutes');
const retailerBankRoutes = require('./Routes/retailerBankRoutes');
const path = require('path');


const app = express();

// Middleware
app.use(cors({
  
origin: process.env.CORS_ORIGIN  || "https://full-ecom9-frontend.vercel.app",

   credentials: true,
 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_key'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// Test database connection
testConnection()
  .then(connected => {
    if (!connected) {
      console.warn('Warning: Database connection failed. Some features may not work properly.');
    }
  })
  .catch(err => {
    console.error('Error testing database connection:', err);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use("/api/user-roles", userRoleRoutes); 
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", SubcategoriesRoutes);
app.use("/api/products", productRoutes); 
app.use('/api/retailers', retailerRoutes);
app.use('/api/retailer-banks', retailerBankRoutes);



// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});




// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
