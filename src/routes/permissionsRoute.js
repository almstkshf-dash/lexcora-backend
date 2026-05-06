const express = require('express');
const router = express.Router();
const permissionsController = require('../controllers/permissionsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET routes
router.get('/', checkPermission('view_permissions'), permissionsController.getPermissions);                        // Get all permissions
router.get('/paginated', checkPermission('view_permissions'), permissionsController.getPermissionsPaginated);      // Get permissions with pagination
router.get('/search', checkPermission('view_permissions'), permissionsController.searchPermissions);               // Search permissions
router.get('/stats', checkPermission('view_permissions'), permissionsController.getPermissionsStats);              // Get permissions statistics
router.get('/employee/:employeeId', checkPermission('view_permissions'), permissionsController.getEmployeePermissions); // Get employee permissions with assignment status
router.get('/name/:name', checkPermission('view_permissions'), permissionsController.getPermissionByName);         // Get permission by name
router.get('/:id', checkPermission('view_permissions'), permissionsController.getPermission);                      // Get specific permission by ID

// POST routes
router.post('/', checkPermission('manage_security'), permissionsController.createPermission);                     // Create new permission
router.post('/bulk', checkPermission('manage_security'), permissionsController.bulkCreatePermissions);            // Bulk create permissions
router.post('/employee/:employeeId/permissions', checkPermission('manage_security'), permissionsController.updateEmployeePermissions); // Update employee permissions

// PUT routes
router.put('/:id', checkPermission('manage_security'), permissionsController.updatePermission);                   // Update permission

// DELETE routes
router.delete('/:id', checkPermission('manage_security'), permissionsController.deletePermission);                // Delete permission

module.exports = router;