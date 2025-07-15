const nodemailer = require('nodemailer');
require("dotenv").config()

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Email configuration
const emailConfig = {
  from: process.env.EMAIL_USER ,
  companyName: 'CustomerStore',
  website: 'https://customerstore.com',
  supportEmail: 'support@customerstore.com'
};

// Verify transporter connection
const verifyConnection = async () => {
  try {
    await transporter.verify();
    
    return true;
  } catch (error) {
   
    return false;
  }
};

// Send email function
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: emailConfig.from,
      to: to,
      subject: subject,
      html: html,
      text: text
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    // console.error('Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  transporter,
  emailConfig,
  verifyConnection,
  sendEmail
}; 