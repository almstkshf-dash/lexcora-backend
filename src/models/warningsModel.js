const db = require("../config/db");

// Get all warnings or by employee_id
const getAllWarnings = async (employeeId = null) => {
  let query = `
    SELECT 
      w.id,
      w.employee_id,
      w.date,
      w.type,
      w.reason,
      w.created_by,
      w.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM warnings w
    LEFT JOIN employees e ON w.employee_id = e.id
    LEFT JOIN employees cb ON w.created_by = cb.id
  `;
  
  const params = [];
  
  if (employeeId) {
    query += ` WHERE w.employee_id = ?`;
    params.push(employeeId);
  }
  
  query += ` ORDER BY w.date DESC, w.created_at DESC`;
  
  const [rows] = await db.query(query, params);
  return rows;
};

// Get warning by ID
const getWarningById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      w.id,
      w.employee_id,
      w.date,
      w.type,
      w.reason,
      w.created_by,
      w.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM warnings w
    LEFT JOIN employees e ON w.employee_id = e.id
    LEFT JOIN employees cb ON w.created_by = cb.id
    WHERE w.id = ?
  `, [id]);
  
  return rows[0];
};

// Get warning documents
const getWarningDocuments = async (warningId) => {
  const [rows] = await db.query(`
    SELECT 
      wd.id,
      wd.warning_id,
      wd.document_name,
      wd.document_url,
      wd.created_by,
      wd.created_at,
      cb.name as created_by_name
    FROM warning_documents wd
    LEFT JOIN employees cb ON wd.created_by = cb.id
    WHERE wd.warning_id = ?
    ORDER BY wd.created_at DESC
  `, [warningId]);
  
  return rows;
};

// Create warning
const createWarning = async (warningData) => {
  const {
    employee_id,
    date,
    type,
    reason,
    created_by
  } = warningData;

  const [result] = await db.query(
    `INSERT INTO warnings 
      (employee_id, date, type, reason, created_by) 
    VALUES (?, ?, ?, ?, ?)`,
    [employee_id, date, type, reason, created_by]
  );

  return result.insertId;
};

// Create warning document
const createWarningDocument = async (documentData) => {
  const {
    warning_id,
    document_name,
    document_url,
    created_by
  } = documentData;

  const [result] = await db.query(
    `INSERT INTO warning_documents 
      (warning_id, document_name, document_url, created_by) 
    VALUES (?, ?, ?, ?)`,
    [warning_id, document_name, document_url, created_by]
  );

  return result.insertId;
};

// Update warning
const updateWarning = async (id, warningData) => {
  const {
    date,
    type,
    reason
  } = warningData;

  const [result] = await db.query(
    `UPDATE warnings 
    SET date = ?, type = ?, reason = ?
    WHERE id = ?`,
    [date, type, reason, id]
  );

  return result.affectedRows;
};

// Delete warning document
const deleteWarningDocument = async (documentId, warningId) => {
  const [result] = await db.query(
    "DELETE FROM warning_documents WHERE id = ? AND warning_id = ?",
    [documentId, warningId]
  );
  return result.affectedRows;
};

// Delete warning (documents will be cascade deleted)
const deleteWarning = async (id) => {
  const [result] = await db.query("DELETE FROM warnings WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = {
  getAllWarnings,
  getWarningById,
  getWarningDocuments,
  createWarning,
  createWarningDocument,
  updateWarning,
  deleteWarningDocument,
  deleteWarning
};
