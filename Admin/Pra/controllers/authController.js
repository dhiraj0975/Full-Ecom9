const { pool } = require("../Config/Db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { blacklistToken } = require("../middleware/blacklistToken");
const User = require("../model/user.modle");
const sendMail = require("../Helpers/sendMail");
// const sendSms = require("../Helpers/sendSms"); // Removed
const crypto = require("crypto");

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password, role_ids, phone = null, status = 'active' } = req.body;

      if (!name || !email || !password || !role_ids || !Array.isArray(role_ids) || role_ids.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: "Name, email, password, and at least one role are required." 
        });
      }

      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({ success: false, message: "User with this email already exists." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUserPayload = {
        name,
        email,
        password: hashedPassword,
        phone,
        status,
        role_ids
      };

      const createdUser = await User.create(newUserPayload);

      res.status(201).json({ 
        success: true, 
        message: "User registered successfully.", 
        userId: createdUser.id 
      });

    } catch (err) {
      console.error("Register Error:", err);
      res.status(500).json({ success: false, message: "Registration failed", error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password, rememberMe } = req.body;
      if (!email || !password)
        return res.status(400).json({ success: false, message: "Email and password required" });

      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
      const user = users[0];
      if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ success: false, message: "Invalid credentials" });

      const [roles] = await pool.query(
        `SELECT r.role_name FROM user_role_assigne ur
         JOIN admin_roles r ON ur.role_id = r.role_id WHERE ur.user_id = ?`, [user.id]
      );

      const userRoles = roles.map(r => r.role_name);

      // Check if user has an 'Admin' role (case-insensitive)
      const isAdmin = userRoles.some(role => role.toLowerCase() === 'admin');
      if (!isAdmin) {
        return res.status(403).json({ success: false, message: "Access Denied: Only admins can log in." });
      }

      const token = jwt.sign({ id: user.id, email: user.email, roles: userRoles }, process.env.JWT_SECRET, {
        expiresIn: rememberMe ? "7d" : "24h"
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,         // 🔐 Always true for Vercel deployment (HTTPS)
        sameSite: "None",     // ✅ Allow cross-origin cookies
        maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000
      });


      res.json({ success: true, message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, roles: userRoles } });
    } catch (err) {
      console.error("Login Error:", err);
      res.status(500).json({ success: false, message: "Login failed", error: err.message });
    }
  },

  logout: (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
      res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Logout failed", error: error.message });
    }
  },

  getCurrentUser: (req, res) => {
    pool.query("SELECT id, name, email, phone FROM users WHERE id = ?", [req.user.id])
      .then(([users]) => users.length
        ? res.json({ success: true, user: users[0] })
        : res.status(404).json({ success: false, message: "User not found" })
      )
      .catch(err =>
        res.status(500).json({ success: false, message: "Failed to get user", error: err.message })
      );
  },

  // Forgot Password - Send OTP
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body; // Changed back to 'email'
      if (!email) return res.status(400).json({ success: false, message: "Email required" });
      
      const user = await User.getByEmail(email);

      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
      
      await User.setOTP(email, otp, otp_expiry);

      const emailSubject = "Your Password Reset Code";
      const emailBody = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div style="text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px;">
             <h1 style="color: #004a99; font-size: 24px;">Shopho</h1>
          </div>
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password for your Shopho account. Please use the One-Time Password (OTP) below to proceed.</p>
          <div style="background-color: #f2f2f2; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <p style="font-size: 24px; font-weight: bold; color: #004a99; letter-spacing: 3px; margin: 0;">${otp}</p>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request a password reset, please disregard this email. Your account is secure.</p>
          <p>For your security, please do not share this code with anyone.</p>
          <p>Thank you,<br/>The Shopho Team</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated message. Please do not reply to this email.</p>
        </div>
      `;

      await sendMail(email, emailSubject, emailBody);
      res.json({ success: true, message: "OTP sent to your email." });
      
    } catch (err) {
      console.error("Forgot Password Error:", err);
      res.status(500).json({ success: false, message: "Failed to send OTP", error: err.message });
    }
  },

  // Verify OTP
  verifyOTP: async (req, res) => {
    try {
      const { email, otp } = req.body; // Changed back to 'email'
      if (!email || !otp) return res.status(400).json({ success: false, message: "Email and OTP required" });
      const user = await User.verifyOTP(email, otp);
      if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      res.json({ success: true, message: "OTP verified" });
    } catch (err) {
      res.status(500).json({ success: false, message: "OTP verification failed", error: err.message });
    }
  },

  // Reset Password
  resetPassword: async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body; // Changed back to 'email'
      if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: "All fields required" });
      const user = await User.verifyOTP(email, otp);
      if (!user) return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      const hashed = await bcrypt.hash(newPassword, 10);
      await User.resetPassword(email, hashed);
      res.json({ success: true, message: "Password reset successful" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Password reset failed", error: err.message });
    }
  },
};

module.exports = authController;
