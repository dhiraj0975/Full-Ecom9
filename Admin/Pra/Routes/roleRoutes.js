const express = require("express");
const roleRoutes = express.Router();
const roleController = require("../controllers/roleController");
const isAdmin = require("../middleware/isAdmin");

roleRoutes.post("/",roleController.createRole);
roleRoutes.get("/", roleController.getRoles);
roleRoutes.put("/:id", roleController.updateRole);
roleRoutes.patch("/:id/status", roleController.updateRoleStatus);
roleRoutes.delete("/:id", roleController.deleteRole);

module.exports = roleRoutes; 
