const userRoleModel = require("../model/userRoleModel");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess, sendError } = require("../utils/responseHandler");
  const { pool } = require("../Config/Db");

const userRoleController = {
  // ✅ Assign a single role to a user (for backward compatibility)
  assignRole: async (req, res, next) => {
    try {
      const { role_id } = req.body;
      const user_id = req.user?.id || req.body.user_id;

      if (!user_id || !role_id) {
        return res.status(400).json({
          success: false,
          message: "User ID and role ID are required"
        });
      }

      await userRoleModel.assignRole(user_id, role_id);
      
      // If this is middleware, call next, otherwise send response
      if (next) {
        next();
      } else {
        res.json({
          success: true,
          message: "Role assigned successfully",
          data: { user_id, role_id }
        });
      }
    } catch (error) {
      console.error("Assign role error:", error);
      if (next) {
        next(error);
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to assign role"
        });
      }
    }
  },

  // ✅ Assign multiple roles to a user
  assignMultipleRoles: async (req, res) => {
    try {
      const { user_id, role_ids } = req.body;
      console.log("assignMultipleRoles called with:", { user_id, role_ids });

      if (!user_id || !role_ids || !Array.isArray(role_ids)) {
        return res.status(400).json({
          success: false,
          message: "User ID and array of role IDs are required"
        });
      }

      await userRoleModel.assignMultipleRoles(user_id, role_ids);
      console.log(`Successfully assigned ${role_ids.length} roles to user ${user_id}`);
      
      res.json({
        success: true,
        message: "Roles assigned successfully",
        data: { user_id, role_ids }
      });
    } catch (error) {
      console.error("Assign multiple roles error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to assign roles"
      });
    }
  },

  // ✅ Get all roles for a specific user
  getUserRoles: async (req, res) => {
    try {
      const { user_id } = req.params;
      
      if (!user_id) {
      return res.status(400).json({
          success: false,
          message: "User ID is required"
        });
      }

      const roles = await userRoleModel.getUserRolesDetailed(user_id);
      
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error("Get user roles error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get user roles"
      });
    }
  },

  // ✅ Add a single role to user
  addRoleToUser: async (req, res) => {
    try {
      const { user_id, role_id } = req.body;

      if (!user_id || !role_id) {
        return res.status(400).json({
          success: false,
          message: "User ID and role ID are required"
        });
      }

      await userRoleModel.addRoleToUser(user_id, role_id);
      
      res.json({
        success: true,
        message: "Role added successfully",
        data: { user_id, role_id }
      });
    } catch (error) {
      console.error("Add role to user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add role to user"
      });
    }
  },

  // ✅ Remove a specific role from user
  removeRoleFromUser: async (req, res) => {
    try {
      const { user_id, role_id } = req.body;

      if (!user_id || !role_id) {
        return res.status(400).json({
          success: false,
          message: "User ID and role ID are required"
        });
      }

      await userRoleModel.removeRoleFromUser(user_id, role_id);
      
      res.json({
        success: true,
        message: "Role removed successfully",
        data: { user_id, role_id }
      });
    } catch (error) {
      console.error("Remove role from user error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove role from user"
      });
    }
  },

  // ✅ Get all role assignments (existing method)
  getAllRoleAssignments: async (req, res) => {
    try {
      const query = `
        SELECT 
          ur.id,
          ur.user_id,
          ur.role_id,
          u.name AS user_name,
          r.role_name
        FROM user_role_assigne ur
        JOIN users u ON ur.user_id = u.id
        JOIN admin_roles r ON ur.role_id = r.role_id
        ORDER BY u.name, r.role_name
      `;

      const [rows] = await pool.query(query);
      
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error("Get all role assignments error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch role assignments"
      });
    }
  },

  // ✅ Remove role (for backward compatibility)
  removeRole: async (req, res) => {
    try {
      const { userid, roleid } = req.params;
      
      await userRoleModel.removeRoleFromUser(userid, roleid);
      
      res.json({
        success: true,
        message: "Role removed successfully"
      });
    } catch (error) {
      console.error("Remove role error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove role"
      });
    }
  },

  // ✅ Update role (for backward compatibility)
  updateRole: async (req, res) => {
    try {
      const { user_id, old_role_id, new_role_id } = req.body;
      
      if (!user_id || !old_role_id || !new_role_id) {
        return res.status(400).json({
          success: false,
          message: "User ID, old role ID, and new role ID are required"
        });
      }

      // Remove old role and add new role
      await userRoleModel.removeRoleFromUser(user_id, old_role_id);
      await userRoleModel.addRoleToUser(user_id, new_role_id);
      
      res.json({
        success: true,
        message: "Role updated successfully"
      });
    } catch (error) {
      console.error("Update role error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update role"
      });
    }
  },

  // ✅ Get users by role
  getUsersByRole: async (req, res) => {
    try {
      const { roleid } = req.params;
      
      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.status
        FROM users u
        JOIN user_role_assigne ur ON u.id = ur.user_id
        WHERE ur.role_id = ?
        ORDER BY u.name
      `;

      const [rows] = await pool.query(query, [roleid]);
      
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error("Get users by role error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get users by role"
      });
    }
  },

  // ✅ Get all assigned users
  getAllAssignedUsers: async (req, res) => {
    try {
      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.status,
          GROUP_CONCAT(r.role_name) as roles
       FROM users u
       JOIN user_role_assigne ur ON u.id = ur.user_id
       JOIN admin_roles r ON ur.role_id = r.role_id
        GROUP BY u.id, u.name, u.email, u.phone, u.status
        ORDER BY u.name
      `;

      const [rows] = await pool.query(query);
      
      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error("Get all assigned users error:", error);
    res.status(500).json({ 
      success: false, 
        message: "Failed to get assigned users"
    });
    }
  }
};

module.exports = userRoleController;



