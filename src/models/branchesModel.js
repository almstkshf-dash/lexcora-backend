const db = require("../config/db");
const getAllBranches = async () => {
  const [rows] = await db.query(`
  SELECT id, name_ar, name_en FROM branches
  `);
  return { success: true, data: rows };
};
const createBranch = async (branch) => {
  const { name_ar, name_en } = branch;
  try {
  const [result] = await db.query(`
  INSERT INTO branches (name_ar, name_en) VALUES (?, ?)
  `, [name_ar, name_en]);
  return result.insertId;
  } catch (error) {
    console.error("Error inserting branch:", error);
    }
};
const deleteBranch = async (id) => {
  const [result] = await db.query("DELETE FROM branches WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
module.exports = {
  getAllBranches,
  createBranch,
  deleteBranch
};
