const express = require("express");
const rolesController = require("../controllers/rolesController");

const router = express.Router();

// Get all roles
router.get("/", rolesController.getAllRoles);

// Get roles with usage count
router.get("/usage", rolesController.getRolesWithUsage);

// Get role by ID
router.get("/:id", rolesController.getRoleById);

// Create new role
router.post("/", rolesController.createRole);

// Update role
router.put("/:id", rolesController.updateRole);

// Delete role
router.delete("/:id", rolesController.deleteRole);

module.exports = router;