const { pool } = require("../Config/Db");

exports.assignRole = async (user_id, role_id) => {
  const [result] = await pool.query("INSERT INTO user_role_assigne (user_id, role_id) VALUES (?, ?)", [user_id, role_id]);
  return result;
};

// ✅ Assign multiple roles to a user
exports.assignMultipleRoles = async (user_id, role_ids) => {
  console.log(`Model: Starting multiple role assignment for user ${user_id} with roles:`, role_ids);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // First, remove all existing roles for this user
    const [deleteResult] = await connection.query("DELETE FROM user_role_assigne WHERE user_id = ?", [user_id]);
    console.log(`Model: Deleted ${deleteResult.affectedRows} existing roles for user ${user_id}`);
    
    // Then insert all new roles
    for (const role_id of role_ids) {
      const [insertResult] = await connection.query("INSERT INTO user_role_assigne (user_id, role_id) VALUES (?, ?)", [user_id, role_id]);
      console.log(`Model: Inserted role ${role_id} for user ${user_id}, insertId: ${insertResult.insertId}`);
    }
    
    await connection.commit();
    console.log(`Model: Successfully committed ${role_ids.length} roles for user ${user_id}`);
    return true;
  } catch (error) {
    console.error("Model: Error in assignMultipleRoles:", error);
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ✅ Add a single role to user (without removing existing ones)
exports.addRoleToUser = async (user_id, role_id) => {
  const [result] = await pool.query("INSERT INTO user_role_assigne (user_id, role_id) VALUES (?, ?)", [user_id, role_id]);
  return result;
};

// ✅ Remove a specific role from user
exports.removeRoleFromUser = async (user_id, role_id) => {
  const [result] = await pool.query("DELETE FROM user_role_assigne WHERE user_id = ? AND role_id = ?", [user_id, role_id]);
  return result;
};

exports.getRolesByUserId = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT r.role_id, r.role_name FROM user_role_assigne ur
     JOIN admin_roles r ON ur.role_id = r.role_id
     WHERE ur.user_id = ?`,
    [user_id]
  );
  return rows;
};

// ✅ Get all roles for a user with more details
exports.getUserRolesDetailed = async (user_id) => {
  const [rows] = await pool.query(
    `SELECT 
      ur.id,
      ur.user_id,
      ur.role_id,
      r.role_name,
      r.description
     FROM user_role_assigne ur
     JOIN admin_roles r ON ur.role_id = r.role_id
     WHERE ur.user_id = ?
     ORDER BY r.role_name`,
    [user_id]
  );
  return rows;
};

exports.getUserRoles = async (req, res) => {
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
    `;

    const [result] = await pool.query(query);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch assignments" });
  }
};
  
