const db = require("../config/db");

// Get all parties forms
const getAllPartiesForms = async () => {
  try {
    const query = `
      SELECT 
        pf.id,
        pf.title,
        pf.document_name,
        pf.document_url,
        pf.type,
        pf.created_by,
        pf.created_at,
        pf.updated_at,
        e.name as created_by_name
      FROM parties_forms pf
      LEFT JOIN employees e ON pf.created_by = e.id
      ORDER BY pf.created_at DESC
    `;
    
    const [rows] = await db.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get parties form by ID
const getPartiesFormById = async (id) => {
  try {
    const query = `
      SELECT 
        pf.id,
        pf.title,
        pf.document_name,
        pf.document_url,
        pf.type,
        pf.created_by,
        pf.created_at,
        pf.updated_at,
        e.name as created_by_name
      FROM parties_forms pf
      LEFT JOIN employees e ON pf.created_by = e.id
      WHERE pf.id = ?
    `;
    
    const [rows] = await db.query(query, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get parties forms by type
const getPartiesFormsByType = async (type) => {
  try {
    const query = `
      SELECT 
        pf.id,
        pf.title,
        pf.document_name,
        pf.document_url,
        pf.type,
        pf.created_by,
        pf.created_at,
        pf.updated_at,
        e.name as created_by_name
      FROM parties_forms pf
      LEFT JOIN employees e ON pf.created_by = e.id
      WHERE pf.type = ?
      ORDER BY pf.created_at DESC
    `;
    
    const [rows] = await db.query(query, [type]);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Create new parties form
const createPartiesForm = async (formData) => {
  try {
    const { title, document_name, document_url, type, created_by } = formData;
    
    const query = `
      INSERT INTO parties_forms (title, document_name, document_url, type, created_by)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [title, document_name, document_url, type, created_by]);
    return result.insertId;
  } catch (error) {
    throw error;
  }
};

// Update parties form
const updatePartiesForm = async (id, formData) => {
  try {
    const { title, document_name, document_url, type } = formData;
    
    const query = `
      UPDATE parties_forms 
      SET title = ?, document_name = ?, document_url = ?, type = ?
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [title, document_name, document_url, type, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete parties form
const deletePartiesForm = async (id) => {
  try {
    const query = `DELETE FROM parties_forms WHERE id = ?`;
    const [result] = await db.query(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Get available form types
const getPartiesFormTypes = () => {
  return [
    'welcome_message',
    'price_quote'
  ];
};

module.exports = {
  getAllPartiesForms,
  getPartiesFormById,
  getPartiesFormsByType,
  createPartiesForm,
  updatePartiesForm,
  deletePartiesForm,
  getPartiesFormTypes
};
