const db = require("../config/db");

/**
 * Get all logs with pagination
 */
const getAllLogs = async (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(`
    SELECT 
      l.id,
      l.employee_id,
      e.name as employee_name,
      l.action,
      l.description,
      l.created_at
    FROM logs l
    LEFT JOIN employees e ON l.employee_id = e.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  
  return rows;
};

/**
 * Get total count of logs
 */
const getLogsCount = async () => {
  const [rows] = await db.query(`
    SELECT COUNT(*) as total FROM logs
  `);
  
  return rows[0].total;
};

/**
 * Get log by ID
 */
const getLogById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      l.id,
      l.employee_id,
      e.name as employee_name,
      l.action,
      l.description,
      l.created_at
    FROM logs l
    LEFT JOIN employees e ON l.employee_id = e.id
    WHERE l.id = ?
  `, [id]);
  
  return rows[0];
};

/**
 * Get logs by employee ID
 */
const getLogsByEmployeeId = async (employeeId, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(`
    SELECT 
      l.id,
      l.employee_id,
      e.name as employee_name,
      l.action,
      l.description,
      l.created_at
    FROM logs l
    LEFT JOIN employees e ON l.employee_id = e.id
    WHERE l.employee_id = ?
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `, [employeeId, limit, offset]);
  
  return rows;
};

/**
 * Get logs by action type
 */
const getLogsByAction = async (action, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(`
    SELECT 
      l.id,
      l.employee_id,
      e.name as employee_name,
      l.action,
      l.description,
      l.created_at
    FROM logs l
    LEFT JOIN employees e ON l.employee_id = e.id
    WHERE l.action = ?
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `, [action, limit, offset]);
  
  return rows;
};

/**
 * Create a new log entry
 */
const createLog = async (logData) => {
  const { employee_id, action, description } = logData;
  
  const [result] = await db.query(`
    INSERT INTO logs (employee_id, action, description, created_at)
    VALUES (?, ?, ?, NOW())
  `, [employee_id, action, description]);
  
  return result.insertId;
};

/**
 * Delete logs older than specified days
 */
const deleteOldLogs = async (days = 90) => {
  const [result] = await db.query(`
    DELETE FROM logs 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
  `, [days]);
  
  return result.affectedRows;
};

/**
 * Get logs within date range
 */
const getLogsByDateRange = async (startDate, endDate, page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  const [rows] = await db.query(`
    SELECT 
      l.id,
      l.employee_id,
      e.name as employee_name,
      l.action,
      l.description,
      l.created_at
    FROM logs l
    LEFT JOIN employees e ON l.employee_id = e.id
    WHERE l.created_at BETWEEN ? AND ?
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `, [startDate, endDate, limit, offset]);
  
  return rows;
};

module.exports = {
  getAllLogs,
  getLogsCount,
  getLogById,
  getLogsByEmployeeId,
  getLogsByAction,
  createLog,
  deleteOldLogs,
  getLogsByDateRange
};