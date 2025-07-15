const Customer = require('../models/authModule');
const { sendEmail } = require('../config/email');
const { getWelcomeEmailTemplate } = require('../utils/emailTemplates');
const twilioClient = require('../config/twilio');

// Helper: error response
const errorResponse = (res, code, msg) => res.status(code).json({ success: false, message: msg });

// Register (no DB insert, only save in memory and send OTP)
const register = async (req, res) => {
  const { name, email, phone = null, password } = req.body;
  if (!name || !email || !password || !phone) return errorResponse(res, 400, 'Name, email, phone and password are required');
  if (password.length < 6) return errorResponse(res, 400, 'Password must be at least 6 characters');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return errorResponse(res, 400, 'Invalid email address');
  if (!/^\d{10}$/.test(phone)) return errorResponse(res, 400, 'Invalid phone number');

  try {
    // Check if already registered
    const [exists] = await Customer.pool.execute('SELECT id FROM customers WHERE email = ? OR phone = ?', [email, phone]);
    if (exists.length) return errorResponse(res, 409, 'Email or phone already registered');

    // Save user data in memory (pendingUsers)
    global.pendingUsers = global.pendingUsers || {};
    global.pendingUsers[phone] = {
      name,
      email,
      phone,
      password,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 min expiry
    };

    // Generate OTP and save in memory
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    global.mobileOTPs = global.mobileOTPs || {};
    global.mobileOTPs[phone] = {
      otp,
      email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };

    // Respond immediately
    res.status(200).json({
      success: true,
      message: 'Registration started. OTP is being sent.',
      data: { phone, email }
    });

    // Send OTP via SMS and email in background (no await)
    (async () => {
      try {
        await twilioClient.messages.create({
          body: `Your OTP for mobile verification is: ${otp}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: '+91' + phone // Change country code as needed
        });
        console.log('OTP SMS sent to:', phone);
      } catch (smsError) {
        console.error('Failed to send OTP SMS:', smsError.message);
      }
      try {
        const subject = 'Mobile Verification OTP';
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Mobile Verification OTP</h2>
            <p>Your OTP for mobile verification is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This OTP will expire in 10 minutes.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
          </div>
        `;
      await sendEmail(email, subject, html);
        console.log('OTP email sent to:', email);
    } catch (emailError) {
        console.error('Failed to send OTP email:', emailError.message);
    }
    })();
    
  } catch (err) {
    console.error('Register error:', err);
    return errorResponse(res, 500, err.message);
  }
};

// Login
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return errorResponse(res, 400, 'Email and password are required');
  try {
    const data = await Customer.login(email, password);
    // Set JWT token in HTTP-only cookie
    res.cookie('jwt_token', data.token, {
      httpOnly: true,
      secure: false, // dev ke liye false, prod me true
      sameSite: 'lax', // dev ke liye lax, prod me strict/none
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });
    // Send token and customer both in response
    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      data: {
        token: data.token,
        customer: data.customer
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return errorResponse(res, err.message === 'Invalid email or password' ? 401 : 500, err.message);
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Clear the JWT token cookie
    res.clearCookie('jwt_token', {
      httpOnly: true,
      secure: false, // dev ke liye false, prod me true
      sameSite: 'lax', // dev ke liye lax, prod me strict/none
      path: '/'
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });
  } catch (err) {
    console.error('Logout error:', err);
    return errorResponse(res, 500, 'Logout failed');
  }
};

// Get Profile
const getProfile = async (req, res) => {
  try {
    const data = await Customer.getById(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Profile error:', err);
    return errorResponse(res, err.message === 'Customer not found' ? 404 : 500, err.message);
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const { name, phone = null } = req.body;
  if (!name) return errorResponse(res, 400, 'Name is required');
  try {
    const data = await Customer.updateProfile(req.user.id, { name, phone });
    res.status(200).json({ success: true, message: 'Profile updated', data });
  } catch (err) {
    console.error('Update profile error:', err);
    return errorResponse(res, err.message.includes('not found') ? 404 : 500, err.message);
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return errorResponse(res, 400, 'Current and new password required');
  if (newPassword.length < 6) return errorResponse(res, 400, 'New password must be at least 6 characters');
  try {
    const data = await Customer.changePassword(req.user.id, currentPassword, newPassword);
    res.status(200).json({ success: true, message: 'Password changed', data });
  } catch (err) {
    console.error('Change password error:', err);
    return errorResponse(res, err.message.includes('incorrect') || err.message.includes('not found') ? 400 : 500, err.message);
  }
};

// Verify OTP and Reset Password
const verifyOTPAndResetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !otp || !newPassword) {
    return errorResponse(res, 400, 'Email, OTP, and new password are required');
  }
  
  if (newPassword.length < 6) {
    return errorResponse(res, 400, 'New password must be at least 6 characters');
  }

  try {
    // In a real app, you would:
    // 1. Check if OTP exists in database for this email
    // 2. Verify OTP is not expired
    // 3. Verify OTP matches
    // 4. Update password
    // 5. Delete/expire the OTP
    
    // For now, we'll just simulate the process
    console.log('Verifying OTP:', otp, 'for email:', email);
    
    // Simulate OTP verification (in real app, check against database)
    // For demo purposes, we'll accept any 6-digit OTP
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      return errorResponse(res, 400, 'Invalid OTP format');
    }
    
    // Find user by email and update password
    const data = await Customer.resetPasswordByEmail(email, newPassword);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data
    });
    
  } catch (err) {
    console.error('OTP verification error:', err);
    return errorResponse(res, err.message.includes('not found') ? 404 : 500, err.message);
  }
};

// Generate OTP for mobile verification
const generateMobileOTP = async (req, res) => {
  const { phone, email } = req.body;
  
  if (!phone || !email) {
    return errorResponse(res, 400, 'Phone number and email are required');
  }
  
  if (!/^\d{10}$/.test(phone)) {
    return errorResponse(res, 400, 'Please enter a valid 10-digit phone number');
  }

  try {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // In a real app, you would:
    // 1. Save OTP in database with expiration time
    // 2. Send OTP via SMS service (Twilio, etc.)
    // 3. Set proper expiration (usually 5-10 minutes)
    
    // For demo purposes, we'll save OTP in a simple way
    // In production, use Redis or database with expiration
    global.mobileOTPs = global.mobileOTPs || {};
    global.mobileOTPs[phone] = {
      otp,
      email,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    };
    
    console.log(`OTP generated for ${phone}: ${otp}`);
    
    // For demo, we'll also send email with OTP
    try {
      const subject = 'Mobile Verification OTP';
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Mobile Verification OTP</h2>
          <p>Your OTP for mobile verification is:</p>
          <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this OTP, please ignore this email.</p>
        </div>
      `;
      await sendEmail(email, subject, html);
      console.log('OTP email sent to:', email);
    } catch (emailError) {
      console.error('Failed to send OTP email:', emailError.message);
    }
    
    // Send OTP via Twilio SMS
    try {
      await twilioClient.messages.create({
        body: `Your OTP for mobile verification is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: '+91' + phone // Change country code as needed
      });
      console.log('OTP SMS sent to:', phone);
    } catch (smsError) {
      console.error('Failed to send OTP SMS:', smsError.message);
    }
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      data: { phone, email }
    });
    
  } catch (err) {
    console.error('Generate OTP error:', err);
    return errorResponse(res, 500, 'Failed to generate OTP');
  }
};

// OTP verify: On success, create user in DB, login, and remove from pendingUsers
const verifyMobileOTP = async (req, res) => {
  const { phone, otp, email } = req.body;
  if (!phone || !otp || !email) return errorResponse(res, 400, 'Phone number, OTP, and email are required');
  if (!/^\d{6}$/.test(otp)) return errorResponse(res, 400, 'Invalid OTP format');

  try {
    // Check OTP
    if (!global.mobileOTPs || !global.mobileOTPs[phone]) return errorResponse(res, 400, 'OTP not found or expired');
    const otpData = global.mobileOTPs[phone];
    if (new Date() > otpData.expiresAt) {
      delete global.mobileOTPs[phone];
      return errorResponse(res, 400, 'OTP has expired');
    }
    if (otpData.otp !== otp) return errorResponse(res, 400, 'Invalid OTP');
    if (otpData.email !== email) return errorResponse(res, 400, 'Email mismatch');

    // Get pending user data
    if (!global.pendingUsers || !global.pendingUsers[phone]) return errorResponse(res, 400, 'No pending registration found for this phone');
    const userData = global.pendingUsers[phone];

    // Create user in DB
    const data = await Customer.register(userData);

    // Generate JWT token for auto-login
    const token = await Customer.generateToken(data.id);

    // Clean up
    delete global.mobileOTPs[phone];
    delete global.pendingUsers[phone];

    // Set JWT token in HTTP-only cookie
    res.cookie('jwt_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.status(200).json({
      success: true,
      message: 'Mobile verification successful! Account created.',
      data: {
        token,
        customer: { ...data, name: userData.name, email: userData.email, phone: userData.phone }
      }
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return errorResponse(res, 500, 'Failed to verify OTP');
  }
};

// Get All Customers
const getAllCustomers = async (req, res) => {
  try {
    const data = await Customer.getAll();
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Get all error:', err);
    return errorResponse(res, 500, err.message);
  }
};

// Update Customer State
const updateCustomerState = async (req, res) => {
  const { id } = req.params, { state } = req.body;
  const validStates = ['active', 'inactive', 'pending'];
  if (!state || !validStates.includes(state)) return errorResponse(res, 400, 'Invalid state');
  try {
    const data = await Customer.updateState(id, state);
    res.status(200).json({ success: true, message: 'State updated', data });
  } catch (err) {
    console.error('State update error:', err);
    return errorResponse(res, err.message.includes('not found') ? 404 : 500, err.message);
  }
};

module.exports = {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  verifyOTPAndResetPassword,
  generateMobileOTP,
  verifyMobileOTP,
  getAllCustomers,
  updateCustomerState,
};
