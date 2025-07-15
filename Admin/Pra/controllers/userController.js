const User = require("../model/user.modle");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { hashPassword, comparePassword } = require("../Helpers/hashHelper");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/responseHandler");

const userController = { 
  // Debug endpoint to check database structure
  debugTables: async (req, res) => {
    try {
      const { pool } = require("../Config/Db");
      
      // Check what tables exist
      const [tables] = await pool.query("SHOW TABLES");
      console.log("Available tables:", tables);
      
      // Check users table structure
      const [userColumns] = await pool.query("DESCRIBE users");
      console.log("Users table columns:", userColumns);
      
      // Check if user_role_assigne table exists
      const [roleAssignColumns] = await pool.query("DESCRIBE user_role_assigne");
      console.log("User role assign table columns:", roleAssignColumns);
      
      // Check if admin_roles table exists
      const [adminRolesColumns] = await pool.query("DESCRIBE admin_roles");
      console.log("Admin roles table columns:", adminRolesColumns);
      
      res.json({ 
        success: true, 
        tables: tables,
        userColumns: userColumns,
        roleAssignColumns: roleAssignColumns,
        adminRolesColumns: adminRolesColumns
      });
    } catch (err) {
      console.error("Debug error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Debug failed",
        error: err.message 
      });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      console.log("getAllUsers called");
      const users = await User.getAll();
      console.log("Users fetched successfully:", users.length);
      console.log("First user data:", JSON.stringify(users[0], null, 2));
      res.json({ success: true, data: users });
    } catch (err) {
      console.error("getAllUsers error:", err);
      res.status(500).json({ 
        success: false, 
        message: "Failed to retrieve users",
        error: err.message 
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, data: user });
    } catch {
      res.status(500).json({ success: false, message: "Failed to retrieve user" });
    }
  },

  createUser: async (req, res) => {
    try {
      const { name, email, phone, password, role_ids, status = 'active' } = req.body;

      if (!name || !email || !password || !role_ids || !Array.isArray(role_ids) || role_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Name, email, password, and at least one role are required"
        });
      }

      // Check if user already exists
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists"
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with multiple roles
      const newUserPayload = {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        status,
        role_ids
      };

      const createdUser = await User.create(newUserPayload);

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: { id: createdUser.id, name, email, phone, status }
      });

    } catch (err) {
      console.error("Create User Error:", err);
      res.status(500).json({
        success: false,
        message: "Failed to create user",
        error: err.message
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      console.log("--- Backend: updateUser Controller Hit ---");
      console.log("Request Body Received:", req.body);

      const id = req.params.id;
      const existing = await User.getById(id);
      if (!existing) return res.status(404).json({ success: false, message: "User not found" });

      // Capitalize the first letter of status for consistency
      let formattedStatus = existing.status;
      if (req.body.status && ['active', 'inactive'].includes(req.body.status.toLowerCase())) {
        const status = req.body.status.toLowerCase();
        formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
      }

      const data = {
        name: req.body.name || existing.name,
        email: req.body.email || existing.email,
        phone: req.body.phone ?? existing.phone,
        role_ids: req.body.role_ids || [],
        status: formattedStatus,
      };

      console.log("Data being sent to Model:", data);

      const updated = await User.update(id, data);
      res.json(updated
        ? { success: true, message: "User updated", data: { id, ...data } }
        : { success: false, message: "Update failed" });
    } catch (error) {
      console.error("Update error:", error);
      res.status(500).json({ success: false, message: "Failed to update user" });
    }
  },

  // ✅ Update User Status
  updateUserStatus: async (req, res) => {
    try {
      const { id } = req.params;
      let { status } = req.body; // Use let instead of const

      if (!status || !['active', 'inactive'].includes(status.toLowerCase())) {
        return res.status(400).json({ success: false, message: "Invalid status provided. Use 'active' or 'inactive'." });
      }
      
      // Capitalize the first letter for consistency in the database
      const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

      await User.updateStatus(id, formattedStatus);
      res.json({ success: true, message: `User status updated to ${formattedStatus}` });

    } catch (error) {
      console.error("Update status error:", error);
      res.status(500).json({ success: false, message: "Failed to update user status" });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const user = await User.getById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      const deleted = await User.delete(req.params.id);
      res.json(deleted
        ? { success: true, message: "User deleted" }
        : { success: false, message: "Delete failed" });
    } catch {
      res.status(500).json({ success: false, message: "Failed to delete user" });
    }
  },
};

module.exports = userController;
