const db = require("../config/db");

const getAllCourts = async () => {
  const [rows] = await db.query(`
  SELECT * FROM courts
  `);
  return rows;
};

const getCourtById = async (id) => {
  const [rows] = await db.query(`
  SELECT * FROM courts WHERE id = ?
  `, [id]);
  return rows[0];
};

const createCourt = async (court) => {
  const { court_ar, court_en } = court;
  const [result] = await db.query(`
  INSERT INTO courts (court_ar, court_en) VALUES (?, ?)
  `, [court_ar, court_en]);
  return result.insertId;
};
const addCaseCourtDocument = async (case_id, document_name, document_url, uploaded_by = null) => {
  try {
    const [result] = await db.query(`
      INSERT INTO court_case_documents (case_id, document_name, document_url, uploaded_by) VALUES (?, ?, ?, ?)
    `, [case_id, document_name, document_url, uploaded_by]);
    return result.insertId;
  } catch (error) {
    console.error('Error adding court document:', error);
    throw error;
  }
};

const updateCourt = async (id, court) => {
  const { court_ar, court_en } = court;
  const [result] = await db.query(`
  UPDATE courts SET court_ar = ?, court_en = ? WHERE id = ?
  `, [court_ar, court_en, id]);
  return result.affectedRows > 0;
};

const deleteCourt = async (id) => {
  const [result] = await db.query("DELETE FROM courts WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt,
  addCaseCourtDocument
};