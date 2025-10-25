const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
// const { authenticateToken } = require('../middliewares/authMiddleware');

// Get performance statistics (temporarily without auth for testing)
router.get('/stats', performanceController.getPerformanceStats);

// Clear all system logs (temporarily without auth for testing)
router.delete('/clear-logs', performanceController.clearSystemLogs);

// Clear all notifications (temporarily without auth for testing)
router.delete('/clear-notifications', performanceController.clearNotifications);

module.exports = router;
