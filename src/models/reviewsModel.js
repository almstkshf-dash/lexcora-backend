const db = require("../config/db");

// Get all reviews or by employee_id
const getAllReviews = async (employeeId = null) => {
  let query = `
    SELECT 
      r.id,
      r.employee_id,
      r.type,
      r.date,
      r.created_by,
      r.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM reviews r
    LEFT JOIN employees e ON r.employee_id = e.id
    LEFT JOIN employees cb ON r.created_by = cb.id
  `;
  
  const params = [];
  
  if (employeeId) {
    query += ` WHERE r.employee_id = ?`;
    params.push(employeeId);
  }
  
  query += ` ORDER BY r.date DESC, r.created_at DESC`;
  
  const [rows] = await db.query(query, params);
  return rows;
};

// Get review by ID
const getReviewById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      r.id,
      r.employee_id,
      r.type,
      r.date,
      r.created_by,
      r.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM reviews r
    LEFT JOIN employees e ON r.employee_id = e.id
    LEFT JOIN employees cb ON r.created_by = cb.id
    WHERE r.id = ?
  `, [id]);
  
  return rows[0];
};

// Get review documents
const getReviewDocuments = async (reviewId) => {
  const [rows] = await db.query(`
    SELECT 
      rd.id,
      rd.review_id,
      rd.document_name,
      rd.document_url,
      rd.created_by,
      rd.created_at,
      cb.name as created_by_name
    FROM review_documents rd
    LEFT JOIN employees cb ON rd.created_by = cb.id
    WHERE rd.review_id = ?
    ORDER BY rd.created_at DESC
  `, [reviewId]);
  
  return rows;
};

// Create review
const createReview = async (reviewData) => {
  const {
    employee_id,
    type,
    date,
    created_by
  } = reviewData;

  const [result] = await db.query(
    `INSERT INTO reviews 
      (employee_id, type, date, created_by) 
    VALUES (?, ?, ?, ?)`,
    [employee_id, type, date, created_by]
  );

  return result.insertId;
};

// Create review document
const createReviewDocument = async (documentData) => {
  const {
    review_id,
    document_name,
    document_url,
    created_by
  } = documentData;

  const [result] = await db.query(
    `INSERT INTO review_documents 
      (review_id, document_name, document_url, created_by) 
    VALUES (?, ?, ?, ?)`,
    [review_id, document_name, document_url, created_by]
  );

  return result.insertId;
};

// Update review
const updateReview = async (id, reviewData) => {
  const {
    type,
    date
  } = reviewData;

  const [result] = await db.query(
    `UPDATE reviews 
    SET type = ?, date = ?
    WHERE id = ?`,
    [type, date, id]
  );

  return result.affectedRows;
};

// Delete review document
const deleteReviewDocument = async (documentId, reviewId) => {
  const [result] = await db.query(
    "DELETE FROM review_documents WHERE id = ? AND review_id = ?",
    [documentId, reviewId]
  );
  return result.affectedRows;
};

// Delete review (documents will be cascade deleted)
const deleteReview = async (id) => {
  const [result] = await db.query("DELETE FROM reviews WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = {
  getAllReviews,
  getReviewById,
  getReviewDocuments,
  createReview,
  createReviewDocument,
  updateReview,
  deleteReviewDocument,
  deleteReview
};
