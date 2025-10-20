const db = require('../config/db');

/**
 * Get all call logs with pagination and filters
 */
const getAllCallLogs = async (page = 1, limit = 10, search = '', callType = '') => {
  const offset = (page - 1) * limit;
  
  let query = `
    SELECT 
      cl.*,
      e.name as created_by_name
    FROM call_logs cl
    LEFT JOIN employees e ON cl.created_by = e.id
    WHERE 1=1
  `;
  
  const params = [];
  
  // Add search filter
  if (search) {
    query += ` AND (cl.caller_name LIKE ? OR cl.phone_number LIKE ? OR cl.topic LIKE ? OR cl.details LIKE ? OR cl.file_case_number LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  // Add call type filter
  if (callType && callType !== 'all') {
    query += ` AND cl.call_type = ?`;
    params.push(callType);
  }
  
  query += ` ORDER BY cl.call_date DESC, cl.call_time DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const [callLogs] = await db.query(query, params);
  return callLogs;
};

/**
 * Get call logs count with filters
 */
const getCallLogsCount = async (search = '', callType = '') => {
  let query = `SELECT COUNT(*) as count FROM call_logs WHERE 1=1`;
  const params = [];
  
  // Add search filter
  if (search) {
    query += ` AND (caller_name LIKE ? OR phone_number LIKE ? OR topic LIKE ? OR details LIKE ? OR file_case_number LIKE ?)`;
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  // Add call type filter
  if (callType && callType !== 'all') {
    query += ` AND call_type = ?`;
    params.push(callType);
  }
  
  const [result] = await db.query(query, params);
  return result[0].count;
};

/**
 * Get call log by ID
 */
const getCallLogById = async (id) => {
  const [callLogs] = await db.query(
    `SELECT 
      cl.*,
      e.name as created_by_name
    FROM call_logs cl
    LEFT JOIN employees e ON cl.created_by = e.id
    WHERE cl.id = ?`,
    [id]
  );
  
  return callLogs.length > 0 ? callLogs[0] : null;
};

/**
 * Create new call log
 */
const createCallLog = async (callLogData) => {
  const {
    caller_name,
    phone_number,
    call_type,
    call_date,
    call_time,
    topic,
    details,
    duration_minutes,
    file_case_number,
    created_by
  } = callLogData;
  
  const [result] = await db.query(
    `INSERT INTO call_logs 
    (caller_name, phone_number, call_type, call_date, call_time, topic, details, duration_minutes, file_case_number, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [caller_name, phone_number, call_type, call_date, call_time, topic, details, duration_minutes, file_case_number, created_by]
  );
  
  return result.insertId;
};

/**
 * Update call log
 */
const updateCallLog = async (id, callLogData) => {
  const {
    caller_name,
    phone_number,
    call_type,
    call_date,
    call_time,
    topic,
    details,
    duration_minutes,
    file_case_number
  } = callLogData;
  
  const [result] = await db.query(
    `UPDATE call_logs 
    SET caller_name = ?, phone_number = ?, call_type = ?, call_date = ?, 
        call_time = ?, topic = ?, details = ?, duration_minutes = ?, file_case_number = ?
    WHERE id = ?`,
    [caller_name, phone_number, call_type, call_date, call_time, topic, details, duration_minutes, file_case_number, id]
  );
  
  return result.affectedRows > 0;
};

/**
 * Delete call log
 */
const deleteCallLog = async (id) => {
  const [result] = await db.query(
    'DELETE FROM call_logs WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};

module.exports = {
  getAllCallLogs,
  getCallLogsCount,
  getCallLogById,
  createCallLog,
  updateCallLog,
  deleteCallLog
};
