const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get performance statistics
router.get('/stats', authenticateToken, performanceController.getPerformanceStats);

// Clear all call logs
router.delete('/clear-logs', authenticateToken, performanceController.clearCallLogs);

// Clear all notifications
router.delete('/clear-notifications', authenticateToken, performanceController.clearNotifications);

module.exports = router;
