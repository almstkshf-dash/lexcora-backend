const db = require('../config/db');

/**
 * Get performance statistics (counts for logs and notifications)
 */
const getPerformanceStats = async (req, res) => {
  try {
    // Get call logs count
    const [callLogsResult] = await db.query('SELECT COUNT(*) as count FROM call_logs');
    const callLogsCount = callLogsResult[0].count;

    // Get notifications count
    const [notificationsResult] = await db.query('SELECT COUNT(*) as count FROM app_notifications');
    const notificationsCount = notificationsResult[0].count;

    res.json({
      callLogsCount,
      notificationsCount
    });
  } catch (error) {
    console.error('Get performance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance statistics',
      error: error.message
    });
  }
};

/**
 * Clear all call logs
 */
const clearCallLogs = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM call_logs');
    
    res.json({
      success: true,
      message: `${result.affectedRows} call logs deleted successfully`,
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Clear call logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear call logs',
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
  clearCallLogs,
  clearNotifications
};
