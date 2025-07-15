const { pool } = require("../Config/Db");

exports.createRole = (role_name) => {
  return pool.query("INSERT INTO admin_roles (role_name) VALUES (?)", [role_name]);
};

exports.getAllRoles = () => {
  return pool.query("SELECT * FROM admin_roles");
};

exports.updateRole = (id, role_name) => {
  return pool.query("UPDATE admin_roles SET role_name = ? WHERE role_id = ?", [role_name, id]);
};

exports.deleteRole = (id) => {
  return pool.query("DELETE FROM admin_roles WHERE role_id = ?", [id]);
};

exports.updateRoleStatus = async (id, status) => {
  return pool.query("UPDATE admin_roles SET status = ? WHERE role_id = ?", [status, id]);
};

