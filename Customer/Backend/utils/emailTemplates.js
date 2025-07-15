const { emailConfig } = require('../config/email');

// Welcome Email Template
const getWelcomeEmailTemplate = (customerName, email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CustomerStore</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #667eea; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to CustomerStore!</h1>
          <p>Your account has been successfully created</p>
        </div>
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>Thank you for joining <span class="highlight">CustomerStore</span>. We're excited to have you as part of our community!</p>

          <h3>What's next?</h3>
          <ul>
            <li>✅ Complete your profile</li>
            <li>🛍️ Browse our products</li>
            <li>💳 Add payment methods</li>
            <li>📱 Download our mobile app</li>
          </ul>

          <p>Your email: <strong>${email}</strong></p>

          <div style="text-align: center;">
            <a href="${emailConfig.website}" class="button">Start Shopping Now</a>
          </div>

          <p>If you have any questions, feel free to contact our support team at <a href="mailto:${emailConfig.supportEmail}">${emailConfig.supportEmail}</a></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ${emailConfig.companyName}. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Password Reset Email Template
const getPasswordResetTemplate = (customerName, resetToken, email) => {
  const resetUrl = `${emailConfig.website}/reset-password?token=${resetToken}`;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .highlight { color: #667eea; font-weight: bold; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Your Password</h1>
          <p>Click the button below to reset your password</p>
        </div>
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>We received a password reset request for your <span class="highlight">CustomerStore</span> account.</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>

          <div class="warning">
            <strong>⚠️ Important Security Notes:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>

          <p>If you have any questions, contact our support team at <a href="mailto:${emailConfig.supportEmail}">${emailConfig.supportEmail}</a></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ${emailConfig.companyName}. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// OTP Only Email Template (without reset button)
const getOTPOnlyTemplate = (customerName, otp, email) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP Code</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .highlight { color: #667eea; font-weight: bold; }
        .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset OTP</h1>
          <p>Use the OTP below to reset your password</p>
        </div>
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>We received a password reset request for your <span class="highlight">CustomerStore</span> account.</p>

          <!-- OTP Section -->
          <div class="otp-box">
            <h3>🔢 Your 6-Digit OTP</h3>
            <div class="otp-code">${otp}</div>
            <p>Enter this code to verify your identity</p>
          </div>

          <div class="warning">
            <strong>⚠️ Important Security Notes:</strong>
            <ul>
              <li>Your OTP will expire in 10 minutes</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>Never share your OTP with anyone</li>
            </ul>
          </div>

          <p>If you have any questions, contact our support team at <a href="mailto:${emailConfig.supportEmail}">${emailConfig.supportEmail}</a></p>
        </div>
        <div class="footer">
          <p>&copy; 2024 ${emailConfig.companyName}. All rights reserved.</p>
          <p>This email was sent to ${email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getWelcomeEmailTemplate,
  getPasswordResetTemplate,
  getOTPOnlyTemplate
};
