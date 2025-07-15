// 📁 model/user.model.js
const { pool } = require("../Config/Db");

class User {
  constructor(user) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
  }

  // ✅ Get All Users with Aggregated Roles
  static async getAll() {
    console.log("=== User.getAll() with GROUP_CONCAT called ===");
    try {
      const [rows] = await pool.query(`
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.status,
          u.created_at,
          GROUP_CONCAT(r.role_id) AS role_ids,
          GROUP_CONCAT(r.role_name) AS role_names
        FROM users u
        LEFT JOIN user_role_assigne ura ON u.id = ura.user_id
        LEFT JOIN admin_roles r ON ura.role_id = r.role_id
        GROUP BY u.id, u.name, u.email, u.phone, u.status
        ORDER BY u.id DESC
      `);

      console.log(`Found ${rows.length} unique users.`);

      const usersWithRoles = rows.map(user => {
        const role_ids = user.role_ids ? user.role_ids.split(',') : [];
        const role_names = user.role_names ? user.role_names.split(',') : [];
        
        const roles = role_ids.map((id, index) => ({
          role_id: parseInt(id, 10),
          role_name: role_names[index]
        }));

        const finalUser = {
          ...user,
          roles: roles,
          role_names: user.role_names || 'N/A'
        };
        delete finalUser.role_ids; // Clean up intermediate field
        return finalUser;
      });
      
      console.log("First user sample with aggregated roles:", JSON.stringify(usersWithRoles[0], null, 2));

      return usersWithRoles;
    } catch (error) {
      console.error("Error in User.getAll() with GROUP_CONCAT:", error);
      throw error; // Re-throw the error to be handled by the controller
    }
  }

  // ✅ Get user by ID
  static async getById(id) {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  // ✅ Get user by Email
  static async getByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  }

  // ✅ Get user by Phone - REMOVED
  /*
  static async getByPhone(phone) {
    const [rows] = await pool.query("SELECT * FROM users WHERE phone = ?", [phone]);
    return rows[0];
  }
  */

  // ✅ Create user and assign multiple roles
  static async create(newUser) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const userQuery = "INSERT INTO users (name, email, phone, password, status) VALUES (?, ?, ?, ?, ?)";
      const [result] = await connection.query(userQuery, [
        newUser.name,
        newUser.email,
        newUser.phone,
        newUser.password,
        newUser.status || 'active'
      ]);
      const userId = result.insertId;

      // Assign roles if role_ids are provided
      if (newUser.role_ids && newUser.role_ids.length > 0) {
        // Filter out any null or undefined role IDs
        const validRoleIds = newUser.role_ids.filter(roleId => roleId !== null && roleId !== undefined);
        
        if (validRoleIds.length > 0) {
          const roleQuery = "INSERT INTO user_role_assigne (user_id, role_id) VALUES ?";
          const roleValues = validRoleIds.map(roleId => [userId, roleId]);
          await connection.query(roleQuery, [roleValues]);
        }
      }

      await connection.commit();
      return { id: userId, ...newUser };
    } catch (error) {
      await connection.rollback();
      console.error("Error in User.create transaction:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // ✅ Update user and roles
  static async update(id, user) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update user info
      const updateUserQuery = "UPDATE users SET name = ?, email = ?, phone = ?, status = ? WHERE id = ?";
      await connection.query(updateUserQuery, [user.name, user.email, user.phone, user.status, id]);

      // Update roles if role_ids are provided
      if (user.role_ids) {
        // 1. Delete existing roles
        await connection.query("DELETE FROM user_role_assigne WHERE user_id = ?", [id]);
        
        // 2. Insert new roles (if any)
        if (user.role_ids.length > 0) {
          // Filter out any null or undefined role IDs
          const validRoleIds = user.role_ids.filter(roleId => roleId !== null && roleId !== undefined);
          
          if (validRoleIds.length > 0) {
            const insertRolesQuery = "INSERT INTO user_role_assigne (user_id, role_id) VALUES ?";
            const roleValues = validRoleIds.map(roleId => [id, roleId]);
            await connection.query(insertRolesQuery, [roleValues]);
          }
        }
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("Error in User.update transaction:", error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // ✅ Delete user
  static async delete(id) {
    await pool.query("DELETE FROM user_role_assigne WHERE user_id = ?", [id]); // delete role first
    const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  // Set OTP and expiry for user (by email)
  static async setOTP(email, otp, otp_expiry) {
    const query = "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?";
    await pool.query(query, [otp, otp_expiry, email]);
    return true;
  }

  // Verify OTP (by email)
  static async verifyOTP(email, otp) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND otp = ? AND otp_expiry > NOW()",
      [email, otp]
    );
    return rows[0];
  }

  // Reset password (by email)
  static async resetPassword(email, newPassword) {
    const query = "UPDATE users SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?";
    await pool.query(query, [newPassword, email]);
    return true;
  }

  // ✅ Update user status
  static async updateStatus(id, status) {
    // Assuming 'status' column is a string like 'active' or 'inactive'
    const query = "UPDATE users SET status = ? WHERE id = ?";
    await pool.query(query, [status, id]);
    return true;
  }
}

module.exports = User;
