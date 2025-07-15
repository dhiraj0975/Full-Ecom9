const express = require("express");
const userRoleRouter = express.Router();
const userRoleController = require("../controllers/userRoleController");
const auth = require("../middleware/auth"); // Authentication middleware
const isAdmin = require("../middleware/isAdmin")

userRoleRouter.use(auth);

userRoleRouter.post("/assign",isAdmin, userRoleController.assignRole);
userRoleRouter.delete("/:userid/:roleid",isAdmin, userRoleController.removeRole);
userRoleRouter.put("/update",isAdmin, userRoleController.updateRole);
// ========================= role ke base me or user  ke base me chek ======================= 
userRoleRouter.get("/user/:userid",isAdmin, userRoleController.getUserRoles);
userRoleRouter.get("/role/:roleid",isAdmin, userRoleController.getUsersByRole);
userRoleRouter.get("/assigned-users", isAdmin, userRoleController.getAllAssignedUsers);

// ✅ New routes for multiple role assignment
userRoleRouter.post("/assign-multiple", isAdmin, userRoleController.assignMultipleRoles);
userRoleRouter.post("/add-role", isAdmin, userRoleController.addRoleToUser);
userRoleRouter.post("/remove-role", isAdmin, userRoleController.removeRoleFromUser);
userRoleRouter.get("/user-roles/:user_id", isAdmin, userRoleController.getUserRoles);
userRoleRouter.get("/all-assignments", isAdmin, userRoleController.getAllRoleAssignments);

module.exports = userRoleRouter;   
