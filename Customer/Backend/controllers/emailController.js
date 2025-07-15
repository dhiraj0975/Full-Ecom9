const { sendEmail } = require('../config/email');
const { getWelcomeEmailTemplate, getPasswordResetTemplate, getOTPOnlyTemplate } = require('../utils/emailTemplates');
const crypto = require('crypto');

// Send welcome email
const sendWelcomeEmail = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    const subject = 'Welcome to CustomerStore!';
    const html = getWelcomeEmailTemplate(name, email);

    const result = await sendEmail(email, subject, html);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Welcome email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send welcome email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send password reset email
const sendPasswordResetEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // In a real app, you would save this token to the database
    // For now, we'll just send the email
    console.log('Reset token:', resetToken);
    console.log('Token expires:', resetTokenExpiry);

    const subject = 'Reset Your Password - CustomerStore';
    const html = getPasswordResetTemplate('User', resetToken, email);

    const result = await sendEmail(email, subject, html);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send password reset email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send OTP email (OTP only, no reset button)
const sendOTPEmail = async (req, res) => {
  try {
    const { email, customerName = 'User' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, you would save this OTP to the database with expiry
    // For now, we'll just send the email
    console.log('OTP:', otp);

    const subject = 'Your OTP Code - CustomerStore';
    const html = getOTPOnlyTemplate(customerName, otp, email);

    const result = await sendEmail(email, subject, html);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP email sent successfully',
        messageId: result.messageId,
        otp: otp // In production, don't send OTP in response
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send OTP email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Send custom email
const sendCustomEmail = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        message: 'To, subject, and html content are required'
      });
    }

    const result = await sendEmail(to, subject, html, text);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending custom email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Test email connection
const testEmailConnection = async (req, res) => {
  try {
    const { verifyConnection } = require('../config/email');
    const isConnected = await verifyConnection();

    if (isConnected) {
      res.status(200).json({
        success: true,
        message: 'Email connection is working properly'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email connection failed'
      });
    }
  } catch (error) {
    console.error('Error testing email connection:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendOTPEmail,
  sendCustomEmail,
  testEmailConnection
}; 