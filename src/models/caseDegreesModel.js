const db = require("../config/db");

// Get all case degrees
const getAllCaseDegrees = async () => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM case_degrees ORDER BY created_at DESC"
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get case degree by ID
const getCaseDegreeById = async (id) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM case_degrees WHERE id = ?",
      [id]
    );
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get case degrees by case ID
const getCaseDegreesByCaseId = async (caseId) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM case_degrees WHERE case_id = ? ORDER BY created_at DESC",
      [caseId]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

// Create new case degree
const createCaseDegree = async (caseDegreeData) => {
  try {
    const {
      case_id,
      degree,
      case_number,
      year,
      referral_date
    } = caseDegreeData;

    const [result] = await db.execute(
      `INSERT INTO case_degrees (case_id, degree, case_number, year, referral_date, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [case_id, degree, case_number, year, referral_date]
    );

    return { id: result.insertId, ...caseDegreeData };
  } catch (error) {
    throw error;
  }
};

// Update case degree
const updateCaseDegree = async (id, caseDegreeData) => {
  try {
    const {
      case_id,
      degree,
      case_number,
      year,
      referral_date
    } = caseDegreeData;

    const [result] = await db.execute(
      `UPDATE case_degrees 
       SET case_id = ?, degree = ?, case_number = ?, year = ?, referral_date = ?, updated_at = NOW()
       WHERE id = ?`,
      [case_id, degree, case_number, year, referral_date, id]
    );

    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Delete case degree
const deleteCaseDegree = async (id) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM case_degrees WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

// Search case degrees
const searchCaseDegrees = async (searchTerm) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM case_degrees 
       WHERE degree LIKE ? OR case_number LIKE ? OR year LIKE ?
       ORDER BY created_at DESC`,
      [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
    );
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllCaseDegrees,
  getCaseDegreeById,
  getCaseDegreesByCaseId,
  createCaseDegree,
  updateCaseDegree,
  deleteCaseDegree,
  searchCaseDegrees
};