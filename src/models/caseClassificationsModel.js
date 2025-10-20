const db = require("../config/db");

const getAllCaseClassifications = async () => {
  const [rows] = await db.query(`SELECT * FROM case_classifications`);
  return rows;
};

const createCaseClassification = async (classification) => {
  const { name_ar, name_en } = classification;
  const [result] = await db.query(`
    INSERT INTO case_classifications (name_ar, name_en) VALUES (?, ?)
  `, [name_ar, name_en]);
  return result.insertId;
};
const updateCaseClassification = async (id, classification) => {
  const { name_ar, name_en } = classification;
  const [result] = await db.query(`
    UPDATE case_classifications SET name_ar = ?, name_en = ? WHERE id = ?
  `, [name_ar, name_en, id]);
  return result.affectedRows > 0;
};

const deleteCaseClassification = async (id) => {
  const [result] = await db.query("DELETE FROM case_classifications WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllCaseClassifications,
  createCaseClassification,
  updateCaseClassification,
  deleteCaseClassification
};
