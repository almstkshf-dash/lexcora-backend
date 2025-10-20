const pool = require('../config/db');

const employeeDocumentsModel = {
  // Create a new employee document
  create: async (documentData) => {
    const { employee_id, document_type, document_name, document_url, uploaded_by } = documentData;
    
    const [result] = await pool.query(
      `INSERT INTO employee_documents 
       (employee_id, document_type, document_name, document_url, uploaded_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [employee_id, document_type, document_name, document_url, uploaded_by]
    );
    
    return result.insertId;
  },

  // Get all documents for a specific employee
  getByEmployeeId: async (employeeId) => {
    const [rows] = await pool.query(
      `SELECT 
        ed.*,
        e.name as uploaded_by_name
       FROM employee_documents ed
       LEFT JOIN employees e ON ed.uploaded_by = e.id
       WHERE ed.employee_id = ?
       ORDER BY ed.created_at DESC`,
      [employeeId]
    );
    
    return rows;
  },

  // Get documents by employee ID and type
  getByEmployeeIdAndType: async (employeeId, documentType) => {
    const [rows] = await pool.query(
      `SELECT 
        ed.*,
        e.name as uploaded_by_name
       FROM employee_documents ed
       LEFT JOIN employees e ON ed.uploaded_by = e.id
       WHERE ed.employee_id = ? AND ed.document_type = ?
       ORDER BY ed.created_at DESC`,
      [employeeId, documentType]
    );
    
    return rows;
  },

  // Get a single document by ID
  getById: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        ed.*,
        e.name as uploaded_by_name
       FROM employee_documents ed
       LEFT JOIN employees e ON ed.uploaded_by = e.id
       WHERE ed.id = ?`,
      [id]
    );
    
    return rows[0];
  },

  // Update document
  update: async (id, documentData) => {
    const { document_name, document_url } = documentData;
    
    const [result] = await pool.query(
      `UPDATE employee_documents 
       SET document_name = ?, document_url = ?
       WHERE id = ?`,
      [document_name, document_url, id]
    );
    
    return result.affectedRows;
  },

  // Delete a document
  delete: async (id) => {
    const [result] = await pool.query(
      'DELETE FROM employee_documents WHERE id = ?',
      [id]
    );
    
    return result.affectedRows;
  },

  // Get count of documents by type for an employee
  getCountByType: async (employeeId) => {
    const [rows] = await pool.query(
      `SELECT document_type, COUNT(*) as count
       FROM employee_documents
       WHERE employee_id = ?
       GROUP BY document_type`,
      [employeeId]
    );
    
    return rows;
  }
};

module.exports = employeeDocumentsModel;
