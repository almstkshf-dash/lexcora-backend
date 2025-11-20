const db = require("../config/db");

const getAllCourtCaseDocuments = async ({ page, limit, sortBy, sortOrder }) => {
  const offset = (page - 1) * limit;
  const allowedSort = ['created_at', 'id'];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : 'created_at';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const [countRows] = await db.query('SELECT COUNT(*) as total FROM court_case_documents');
  const total = countRows[0]?.total || 0;

  const [rows] = await db.query(
    `SELECT * FROM court_case_documents ORDER BY ${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return { rows, total };
};

const createCourtCaseDocument = async (courtCaseDocument) => {
  const { case_id, name, url } = courtCaseDocument;
  const [result] = await db.query(`
    INSERT INTO court_case_documents (case_id, name, url) VALUES (?, ?, ?)
  `, [case_id, name, url]);
  return result.insertId;
};

const updateCourtCaseDocument = async (id, courtCaseDocument) => {
  const { case_id, name, url } = courtCaseDocument;
  const [result] = await db.query(` 
    UPDATE court_case_documents SET case_id = ?, name = ?, url = ? WHERE id = ?
  `, [case_id, name, url, id]);
  return result.affectedRows > 0;
};  

const deleteCourtCaseDocument = async (id) => {
  const [result] = await db.query("DELETE FROM court_case_documents WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getCourtCaseDocumentById = async (id) => {
  const [rows] = await db.query("SELECT * FROM court_case_documents WHERE id = ?", [id]);
  return rows[0];
};

const getCourtCaseDocumentsByCourtId = async (courtId) => {
  const [rows] = await db.query(`
    SELECT ccd.*, cd.name as document_name, cd.url as document_url, cd.case_id
    FROM court_case_documents ccd
    JOIN case_documents cd ON ccd.case_document_id = cd.id
    WHERE ccd.court_id = ?
  `, [courtId]);
  return rows;
};

const getCourtCaseDocumentsByCaseDocumentId = async (caseDocumentId) => {
  const [rows] = await db.query(`
    SELECT ccd.*, cd.name as document_name, cd.url as document_url, cd.case_id
    FROM court_case_documents ccd
    JOIN case_documents cd ON ccd.case_document_id = cd.id
    WHERE ccd.case_document_id = ?
  `, [caseDocumentId]);
  return rows;
};

const getCourtCaseDocumentsByStatus = async (status) => {
  const [rows] = await db.query(`
    SELECT ccd.*, cd.name as document_name, cd.url as document_url, cd.case_id
    FROM court_case_documents ccd
    JOIN case_documents cd ON ccd.case_document_id = cd.id
    WHERE ccd.status = ?
  `, [status]);
  return rows;
};

const getCourtCaseDocumentsByDateRange = async (startDate, endDate) => {
  const [rows] = await db.query(`
    SELECT ccd.*, cd.name as document_name, cd.url as document_url, cd.case_id
    FROM court_case_documents ccd
    JOIN case_documents cd ON ccd.case_document_id = cd.id
    WHERE ccd.submission_date BETWEEN ? AND ?
  `, [startDate, endDate]);
  return rows;
};

module.exports = {
  getAllCourtCaseDocuments,
  createCourtCaseDocument,
  updateCourtCaseDocument,
  deleteCourtCaseDocument,
  getCourtCaseDocumentById,
  getCourtCaseDocumentsByCourtId,
  getCourtCaseDocumentsByCaseDocumentId,
  getCourtCaseDocumentsByStatus,
  getCourtCaseDocumentsByDateRange
};
