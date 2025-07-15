// This file will contain the business logic for retailer operations.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { 
  createRetailer, 
  findRetailerByEmail, 
  updateRetailerById, 
  deleteRetailerById,
  getRetailerById
} = require('../models/retailerModel');
const {
  createBankAccount,
  getBankAccountByRetailerId,
  updateBankAccount,
  bankAccountExists
} = require('../models/bankAccountModel');

// Register logic
const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, business_name } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if retailer already exists
    const existing = await findRetailerByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Retailer already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create retailer
    const retailerId = await createRetailer({
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      address: address || null,
      business_name: business_name || null
    });

    res.status(201).json({ message: 'Retailer registered successfully', retailerId });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

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

    // Set token in cookie (for browser)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Return token in response (for Postman/API testing)
    res.json({
      message: 'Login successful',
      token: token, // JWT token for API testing
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

// Logout logic
const logout = async (req, res) => {
  try {
    // Clear the token cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    
    res.json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed', error: err.message });
  }
};

// Get retailer profile
const getProfile = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const retailer = await getRetailerById(retailerId);
    
    if (!retailer) {
      return res.status(404).json({ message: 'Retailer not found' });
    }

    // Remove sensitive data
    const { password, ...retailerData } = retailer;
    
    res.json({
      message: 'Profile retrieved successfully',
      retailer: retailerData
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
};

// Update retailer profile
const updateProfile = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const { name, phone, address, business_name } = req.body;
    
    if (!name || !phone || !address || !business_name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const updated = await updateRetailerById(retailerId, { 
      name, phone, address, business_name 
    });
    
    if (updated) {
      res.json({ message: 'Profile updated successfully' });
    } else {
      res.status(404).json({ message: 'Retailer not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// Get bank account details
const getBankDetails = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const bankAccount = await getBankAccountByRetailerId(retailerId);
    
    if (bankAccount) {
      res.json({
        message: 'Bank details retrieved successfully',
        bankAccount
      });
    } else {
      res.json({
        message: 'No bank details found',
        bankAccount: null
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get bank details', error: err.message });
  }
};

// Update bank account details
const updateBankDetails = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const { bank_name, account_number, ifsc_code, account_holder_name } = req.body;
    
    if (!bank_name || !account_number || !ifsc_code || !account_holder_name) {
      return res.status(400).json({ message: 'All bank details are required' });
    }

    // Validate IFSC code format (basic validation)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc_code)) {
      return res.status(400).json({ message: 'Invalid IFSC code format' });
    }

    // Validate account number (basic validation)
    if (account_number.length < 9 || account_number.length > 18) {
      return res.status(400).json({ message: 'Invalid account number length' });
    }

    // Check if bank account already exists
    const exists = await bankAccountExists(retailerId);
    
    let result;
    if (exists) {
      // Update existing bank account
      result = await updateBankAccount(retailerId, {
        bank_name,
        account_number,
        ifsc_code,
        account_holder_name
      });
    } else {
      // Create new bank account
      result = await createBankAccount({
        retailer_id: retailerId,
        bank_name,
        account_number,
        ifsc_code,
        account_holder_name
      });
    }
    
    if (result) {
      const action = exists ? 'updated' : 'created';
      res.json({ message: `Bank details ${action} successfully` });
    } else {
      res.status(400).json({ message: 'Failed to save bank details' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Bank details update failed', error: err.message });
  }
};

// Delete retailer
const deleteRetailer = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ message: 'Retailer ID is required' });
    }
    const deleted = await deleteRetailerById(id);
    if (deleted) {
      res.json({ message: 'Retailer deleted successfully' });
    } else {
      res.status(404).json({ message: 'Retailer not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

module.exports = { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile, 
  getBankDetails,
  updateBankDetails, 
  deleteRetailer 
}; 