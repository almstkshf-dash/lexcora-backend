const db = require("../config/db");

const getAllLitigationDegrees = async () => {
  const [rows] = await db.query(`SELECT * FROM litigation_degrees`);
  return rows;
};

const createLitigationDegree = async (litigationDegree) => {
  const { degree, case_number, year, referral_date } = litigationDegree;
  const [result] = await db.query(`
    INSERT INTO litigation_degrees (degree, case_number, year, referral_date) VALUES (?, ?, ?, ?)
  `, [degree, case_number, year, referral_date]);
  return result.insertId;
};

const updateLitigationDegree = async (id, litigationDegree) => {
  const { degree, case_number, year, referral_date } = litigationDegree;
  const [result] = await db.query(` 
    UPDATE litigation_degrees SET degree = ?, case_number = ?, year = ?, referral_date = ? WHERE id = ?
  `, [degree, case_number, year, referral_date, id]);
  return result.affectedRows > 0;
};  

const deleteLitigationDegree = async (id) => {
  const [result] = await db.query("DELETE FROM litigation_degrees WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getLitigationDegreeById = async (id) => {
  const [rows] = await db.query("SELECT * FROM litigation_degrees WHERE id = ?", [id]);
  return rows[0];
};

const getLitigationDegreesByYear = async (year) => {
  const [rows] = await db.query("SELECT * FROM litigation_degrees WHERE year = ?", [year]);
  return rows;
};

const getLitigationDegreesByCaseNumber = async (caseNumber) => {
  const [rows] = await db.query("SELECT * FROM litigation_degrees WHERE case_number = ?", [caseNumber]);
  return rows;
};

module.exports = {
  getAllLitigationDegrees,
  createLitigationDegree,
  updateLitigationDegree,
  deleteLitigationDegree,
  getLitigationDegreeById,
  getLitigationDegreesByYear,
  getLitigationDegreesByCaseNumber
};