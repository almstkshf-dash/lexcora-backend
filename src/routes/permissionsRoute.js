const express = require('express');
const router = express.Router();
const permissionsController = require('../controllers/permissionsController');

// GET routes
router.get('/', permissionsController.getPermissions);                        // Get all permissions
router.get('/paginated', permissionsController.getPermissionsPaginated);      // Get permissions with pagination
router.get('/search', permissionsController.searchPermissions);               // Search permissions
router.get('/stats', permissionsController.getPermissionsStats);              // Get permissions statistics
router.get('/employee/:employeeId', permissionsController.getEmployeePermissions); // Get employee permissions with assignment status
router.get('/name/:name', permissionsController.getPermissionByName);         // Get permission by name
router.get('/:id', permissionsController.getPermission);                      // Get specific permission by ID

// POST routes
router.post('/', permissionsController.createPermission);                     // Create new permission
router.post('/bulk', permissionsController.bulkCreatePermissions);            // Bulk create permissions
router.post('/employee/:employeeId/permissions', permissionsController.updateEmployeePermissions); // Update employee permissions

// PUT routes
router.put('/:id', permissionsController.updatePermission);                   // Update permission

// DELETE routes
router.delete('/:id', permissionsController.deletePermission);                // Delete permission

module.exports = router;