const db = require("../config/db");

const getAllCaseDocuments = async ({ page, limit, sortBy, sortOrder }) => {
  const offset = (page - 1) * limit;
  const allowedSort = ['created_at', 'id'];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : 'created_at';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const [countRows] = await db.query('SELECT COUNT(*) as total FROM case_documents');
  const total = countRows[0]?.total || 0;

  const [rows] = await db.query(
    `SELECT * FROM case_documents ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total };
};

const createCaseDocument = async (caseDocument) => {
  const { url, name, case_id } = caseDocument;
  const [result] = await db.query(`
    INSERT INTO case_documents (url, name, case_id) VALUES (?, ?, ?)
  `, [url, name, case_id]);
  return result.insertId;
};

const updateCaseDocument = async (id, caseDocument) => {
  const { url, name, case_id } = caseDocument;
  const [result] = await db.query(` 
    UPDATE case_documents SET url = ?, name = ?, case_id = ? WHERE id = ?
  `, [url, name, case_id, id]);
  return result.affectedRows > 0;
};  

const deleteCaseDocument = async (id) => {
  const [result] = await db.query("DELETE FROM case_documents WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getCaseDocumentById = async (id) => {
  const [rows] = await db.query("SELECT * FROM case_documents WHERE id = ?", [id]);
  return rows[0];
};

const getCaseDocumentsByCaseId = async (caseId) => {
  const [rows] = await db.query("SELECT * FROM case_documents WHERE case_id = ?", [caseId]);
  return rows;
};

module.exports = {
  getAllCaseDocuments,
  createCaseDocument,
  updateCaseDocument,
  deleteCaseDocument,
  getCaseDocumentById,
  getCaseDocumentsByCaseId
};
