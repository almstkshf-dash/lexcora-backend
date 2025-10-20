const db = require("../config/db");

const getAllCaseTypes = async () => {
  const [rows] = await db.query(`SELECT * FROM case_types`);
  return rows;
};

const createCaseType = async (type) => {
  const { name_ar, name_en } = type;
  const [result] = await db.query(`
    INSERT INTO case_types (name_ar, name_en) VALUES (?, ?)
  `, [name_ar, name_en]);
  return result.insertId;
};
const updateCaseType = async (id, type) => {
  const { name_ar, name_en } = type;
  const [result] = await db.query(` 
    UPDATE case_types SET name_ar = ?, name_en = ? WHERE id = ?
  `, [name_ar, name_en, id]);
  return result.affectedRows > 0;
};  


const deleteCaseType = async (id) => {
  const [result] = await db.query("DELETE FROM case_types WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllCaseTypes,
  createCaseType,
  updateCaseType,
  deleteCaseType
};
