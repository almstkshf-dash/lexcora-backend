const db = require("../config/db");

const getAllCaseEmployees = async () => {
  const [rows] = await db.query(`SELECT * FROM case_employees`);
  return rows;
};

const createCaseEmployee = async (caseEmployee) => {
  const { case_id, name, url } = caseEmployee;
  const [result] = await db.query(`
    INSERT INTO case_employees (case_id, name, url) VALUES (?, ?, ?)
  `, [case_id, name, url]);
  return result.insertId;
};

const updateCaseEmployee = async (id, caseEmployee) => {
  const { case_id, name, url } = caseEmployee;
  const [result] = await db.query(` 
    UPDATE case_employees SET case_id = ?, name = ?, url = ? WHERE id = ?
  `, [case_id, name, url, id]);
  return result.affectedRows > 0;
};  

const deleteCaseEmployee = async (id) => {
  const [result] = await db.query("DELETE FROM case_employees WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getCaseEmployeeById = async (id) => {
  const [rows] = await db.query("SELECT * FROM case_employees WHERE id = ?", [id]);
  return rows[0];
};

const getCaseEmployeesByCaseId = async (caseId) => {
  const [rows] = await db.query("SELECT * FROM case_employees WHERE case_id = ?", [caseId]);
  return rows;
};

const getCaseEmployeesByName = async (name) => {
  const [rows] = await db.query("SELECT * FROM case_employees WHERE name LIKE ?", [`%${name}%`]);
  return rows;
};

module.exports = {
  getAllCaseEmployees,
  createCaseEmployee,
  updateCaseEmployee,
  deleteCaseEmployee,
  getCaseEmployeeById,
  getCaseEmployeesByCaseId,
  getCaseEmployeesByName
};