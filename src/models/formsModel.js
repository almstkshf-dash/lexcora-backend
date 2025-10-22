const db = require("../config/db");

// Get all forms
const getAllForms = async () => {
  try {
    const query = `
      SELECT 
        id,
        document_url,
        document_for,
        created_at
      FROM forms
      ORDER BY document_for ASC, created_at DESC
    `;
    
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get form by ID
const getFormById = async (id) => {
  try {
    const query = `
      SELECT 
        id,
        document_url,
        document_for,
        created_at
      FROM forms
      WHERE id = ?
    `;
    
    const [rows] = await db.query(query, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get forms by document type
const getFormsByType = async (document_for) => {
  try {
    const query = `
      SELECT 
        id,
        document_url,
        document_for,
        created_at
      FROM forms
      WHERE document_for = ?
      ORDER BY created_at DESC
    `;
    
    const [rows] = await db.query(query, [document_for]);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Create new form
const createForm = async (formData) => {
  try {
    const { document_url, document_for } = formData;
    
    const query = `
      INSERT INTO forms (document_url, document_for)
      VALUES (?, ?)
    `;
    
    const [result] = await db.query(query, [document_url, document_for]);
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Update form
const updateForm = async (id, formData) => {
  try {
    const { document_url, document_for } = formData;
    
    const query = `
      UPDATE forms 
      SET document_url = ?, document_for = ?
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [document_url, document_for, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete form
const deleteForm = async (id) => {
  try {
    const query = `DELETE FROM forms WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Get available form types (enum values)
const getFormTypes = () => {
  return [
    'early leave',
    'car acknowledgement letter',
    'annual leave encashment',
    'employee information',
    'emergency leave',
    'email acknowledgement',
    'acknowledgement letter',
    'end of service acknowledgement',
    'loan',
    'leave application',
    'sickness self certificate',
    'short absent',
    'salary advance',
    'new starter',
    'others'
  ];
};

module.exports = {
  getAllForms,
  getFormById,
  getFormsByType,
  createForm,
  updateForm,
  deleteForm,
  getFormTypes
};