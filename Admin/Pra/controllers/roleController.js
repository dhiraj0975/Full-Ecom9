// controllers/roleController.js
const roleModel = require("../model/roleModel");

// Create new role
const createRole = async (req, res) => {
  const { role_name } = req.body;
  if (!role_name)
    return res.status(400).json({ message: "Role name is required." });

  try {
    await roleModel.createRole(role_name);
    res.status(201).json({ message: "Role created successfully." });
  } catch (err) {
    res.status(err.code === "ER_DUP_ENTRY" ? 409 : 500).json({
      message:
        err.code === "ER_DUP_ENTRY"
          ? "Role already exists."
          : "Server error.",
    });
  }
};

// Get all roles
const getRoles = async (req, res) => {
  try {
    const [roles] = await roleModel.getAllRoles();
    res.json({ success: true, data: roles });
  } catch {
    res.status(500).json({ message: "Failed to fetch roles." });
  }
};

// Update role name by ID
const updateRole = async (req, res) => {
  const { role_name } = req.body;
  if (!role_name)
    return res.status(400).json({ message: "Role name is required." });

  try {
    await roleModel.updateRole(req.params.id, role_name);
    res.json({ message: "Role updated successfully." });
  } catch {
    res.status(500).json({ message: "Update failed." });
  }
};

// Update role status by ID
const updateRoleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await roleModel.updateRoleStatus(id, status);
    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Status update failed" });
  }
};

// Delete role by ID
const deleteRole = async (req, res) => {
  try {
    await roleModel.deleteRole(req.params.id);
    res.json({ message: "Role deleted successfully." });
  } catch {
    res.status(500).json({ message: "Delete failed." });
  }
};

module.exports = {
  createRole,
  getRoles,
  updateRole,
  updateRoleStatus,
  deleteRole,
};
