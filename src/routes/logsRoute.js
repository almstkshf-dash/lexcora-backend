// logsRoute.js
// Routes for logs management

const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
// router.use(authenticateToken);

// Get all logs with pagination
router.get('/', logsController.getAllLogs);

// Get logs statistics
router.get('/stats', logsController.getLogsStats);

// Get logs by employee ID
router.get('/employee/:employeeId', logsController.getLogsByEmployeeId);

// Get logs by action (type)
router.get('/action/:action', logsController.getLogsByAction);

// Get logs within date range
router.get('/date-range', logsController.getLogsByDateRange);

// Get log by ID (must be after specific routes to avoid conflicts)
router.get('/:id', logsController.getLogById);

// Create a new log entry
router.post('/', logsController.createLog);

// Delete old logs (admin only - you might want to add role-based middleware)
router.delete('/cleanup', logsController.deleteOldLogs);

module.exports = router;
