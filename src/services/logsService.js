/**
 * Logs Service
 * Centralized logging service for tracking user actions across the application
 */

const db = require("../config/db");

/**
 * Create a log entry
 * @param {number} employeeId - ID of the employee performing the action
 * @param {string} action - Type of action: 'add', 'update', 'delete', 'login', 'other'
 * @param {string} description - Description of the action
 * @returns {Promise<number>} - ID of the created log entry
 */
const createLog = async (employeeId, action, description) => {
  try {
    const [result] = await db.query(
      `INSERT INTO logs (employee_id, action, description)
       VALUES (?, ?, ?)`,
      [employeeId, action, description]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error creating log:', error);
    // Don't throw error - logging should not break the main functionality
    return null;
  }
};

/**
 * Log an add action
 */
const logAdd = async (employeeId, entityType, entityName, entityId = null) => {
  const description = entityId 
    ? `أضاف ${entityType}: ${entityName} (ID: ${entityId})`
    : `أضاف ${entityType}: ${entityName}`;
  return await createLog(employeeId, 'add', description);
};

/**
 * Log an update action
 */
const logUpdate = async (employeeId, entityType, entityName, entityId = null) => {
  const description = entityId 
    ? `حدّث ${entityType}: ${entityName} (ID: ${entityId})`
    : `حدّث ${entityType}: ${entityName}`;
  return await createLog(employeeId, 'update', description);
};

/**
 * Log a delete action
 */
const logDelete = async (employeeId, entityType, entityName, entityId = null) => {
  const description = entityId 
    ? `حذف ${entityType}: ${entityName} (ID: ${entityId})`
    : `حذف ${entityType}: ${entityName}`;
  return await createLog(employeeId, 'delete', description);
};

/**
 * Log a login action
 */
const logLogin = async (employeeId, employeeName) => {
  const description = `تسجيل دخول: ${employeeName}`;
  return await createLog(employeeId, 'login', description);
};

/**
 * Log a custom action
 */
const logCustom = async (employeeId, description) => {
  return await createLog(employeeId, 'other', description);
};

/**
 * Bulk create logs (for batch operations)
 */
const createBulkLogs = async (logs) => {
  try {
    if (!logs || logs.length === 0) return;
    
    const values = logs.map(log => [log.employeeId, log.action, log.description]);
    const placeholders = logs.map(() => '(?, ?, ?)').join(', ');
    const flatValues = values.flat();
    
    await db.query(
      `INSERT INTO logs (employee_id, action, description) VALUES ${placeholders}`,
      flatValues
    );
  } catch (error) {
    console.error('Error creating bulk logs:', error);
  }
};

module.exports = {
  createLog,
  logAdd,
  logUpdate,
  logDelete,
  logLogin,
  logCustom,
  createBulkLogs
};
