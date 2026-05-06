const express = require("express");
const rolesController = require("../controllers/rolesController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionsMiddleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all roles
router.get("/", checkPermission('view_roles'), rolesController.getAllRoles);

// Get roles with usage count
router.get("/usage", checkPermission('view_roles'), rolesController.getRolesWithUsage);

// Get role by ID
router.get("/:id", checkPermission('view_roles'), rolesController.getRoleById);

// Create new role
router.post("/", checkPermission('manage_security'), rolesController.createRole);

// Update role
router.put("/:id", checkPermission('manage_security'), rolesController.updateRole);

// Delete role
router.delete("/:id", checkPermission('manage_security'), rolesController.deleteRole);

module.exports = router;