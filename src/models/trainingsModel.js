const db = require("../config/db");

// Get all trainings or by employee_id
const getAllTrainings = async (employeeId = null) => {
  let query = `
    SELECT 
      t.id,
      t.employee_id,
      t.training_date,
      t.type,
      t.created_by,
      t.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM trainings t
    LEFT JOIN employees e ON t.employee_id = e.id
    LEFT JOIN employees cb ON t.created_by = cb.id
  `;
  
  const params = [];
  
  if (employeeId) {
    query += ` WHERE t.employee_id = ?`;
    params.push(employeeId);
  }
  
  query += ` ORDER BY t.training_date DESC, t.created_at DESC`;
  
  const [rows] = await db.query(query, params);
  return rows;
};

// Get training by ID
const getTrainingById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      t.id,
      t.employee_id,
      t.training_date,
      t.type,
      t.created_by,
      t.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM trainings t
    LEFT JOIN employees e ON t.employee_id = e.id
    LEFT JOIN employees cb ON t.created_by = cb.id
    WHERE t.id = ?
  `, [id]);
  
  return rows[0];
};

// Get training documents
const getTrainingDocuments = async (trainingId) => {
  const [rows] = await db.query(`
    SELECT 
      td.id,
      td.training_id,
      td.document_name,
      td.document_url,
      td.created_by,
      td.created_at,
      cb.name as created_by_name
    FROM training_documents td
    LEFT JOIN employees cb ON td.created_by = cb.id
    WHERE td.training_id = ?
    ORDER BY td.created_at DESC
  `, [trainingId]);
  
  return rows;
};

// Create training
const createTraining = async (trainingData) => {
  const {
    employee_id,
    training_date,
    type,
    created_by
  } = trainingData;

  const [result] = await db.query(
    `INSERT INTO trainings 
      (employee_id, training_date, type, created_by) 
    VALUES (?, ?, ?, ?)`,
    [employee_id, training_date, type, created_by]
  );

  return result.insertId;
};

// Create training document
const createTrainingDocument = async (documentData) => {
  const {
    training_id,
    document_name,
    document_url,
    created_by
  } = documentData;

  const [result] = await db.query(
    `INSERT INTO training_documents 
      (training_id, document_name, document_url, created_by) 
    VALUES (?, ?, ?, ?)`,
    [training_id, document_name, document_url, created_by]
  );

  return result.insertId;
};

// Update training
const updateTraining = async (id, trainingData) => {
  const {
    training_date,
    type
  } = trainingData;

  const [result] = await db.query(
    `UPDATE trainings 
    SET training_date = ?, type = ?
    WHERE id = ?`,
    [training_date, type, id]
  );

  return result.affectedRows;
};

// Delete training document
const deleteTrainingDocument = async (documentId, trainingId) => {
  const [result] = await db.query(
    "DELETE FROM training_documents WHERE id = ? AND training_id = ?",
    [documentId, trainingId]
  );
  return result.affectedRows;
};

// Delete training (documents will be cascade deleted)
const deleteTraining = async (id) => {
  const [result] = await db.query("DELETE FROM trainings WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = {
  getAllTrainings,
  getTrainingById,
  getTrainingDocuments,
  createTraining,
  createTrainingDocument,
  updateTraining,
  deleteTrainingDocument,
  deleteTraining
};
