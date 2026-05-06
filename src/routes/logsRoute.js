// logsRoute.js
// Routes for logs management

const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all logs with pagination
router.get('/', checkPermission('view_logs'), logsController.getAllLogs);

// Get logs statistics
router.get('/stats', checkPermission('view_logs'), logsController.getLogsStats);

// Get logs by employee ID
router.get('/employee/:employeeId', checkPermission('view_logs'), logsController.getLogsByEmployeeId);

// Get logs by action (type)
router.get('/action/:action', checkPermission('view_logs'), logsController.getLogsByAction);

// Get logs within date range
router.get('/date-range', checkPermission('view_logs'), logsController.getLogsByDateRange);

// Get log by ID (must be after specific routes to avoid conflicts)
router.get('/:id', checkPermission('view_logs'), logsController.getLogById);

// Create a new log entry
router.post('/', logsController.createLog);

// Delete old logs (admin only)
router.delete('/cleanup', checkPermission('manage_logs'), logsController.deleteOldLogs);

module.exports = router;
