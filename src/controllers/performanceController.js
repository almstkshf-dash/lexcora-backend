const db = require('../config/db');

/**
 * Get performance statistics (counts for logs and notifications)
 */
const getPerformanceStats = async (req, res) => {
  try {
    // Get system logs count
    const [logsResult] = await db.query('SELECT COUNT(*) as count FROM logs');
    const logsCount = logsResult[0].count;

    // Get notifications count
    const [notificationsResult] = await db.query('SELECT COUNT(*) as count FROM app_notifications');
    const notificationsCount = notificationsResult[0].count;

    res.json({
      logsCount,
      notificationsCount
    });
  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance statistics',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Clear all system logs
 */
const clearSystemLogs = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM logs');
    
    res.json({
      success: true,
      message: `${result.affectedRows} system logs deleted successfully`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Clear system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear system logs',
      error: error.message
    });
  }
};

/**
 * Clear all notifications
 */
const clearNotifications = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM app_notifications');
    
    res.json({
      success: true,
      message: `${result.affectedRows} notifications deleted successfully`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Clear notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear notifications',
      error: error.message
    });
  }
};

module.exports = {
  getPerformanceStats,
  clearSystemLogs,
  clearNotifications
};
