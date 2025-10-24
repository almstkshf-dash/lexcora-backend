const db = require("../config/db");
const getAllBranches = async () => {
  const [rows] = await db.query(`
  SELECT id, name_ar, name_en, location FROM branches
  `);
  return { success: true, data: rows };
};
const createBranch = async (branch) => {
  const { name_ar, name_en, location } = branch;
  try {
  const [result] = await db.query(`
  INSERT INTO branches (name_ar, name_en, location) VALUES (?, ?, ?)
  `, [name_ar, name_en, location || null]);
  return result.insertId;
  } catch (error) {
    console.error("Error inserting branch:", error);
    throw error;
  }
};

const updateBranch = async (id, branch) => {
  const { name_ar, name_en, location } = branch;
  try {
    const [result] = await db.query(`
      UPDATE branches SET name_ar = ?, name_en = ?, location = ? WHERE id = ?
    `, [name_ar, name_en, location || null, id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating branch:", error);
    throw error;
  }
};
const deleteBranch = async (id) => {
  const [result] = await db.query("DELETE FROM branches WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
module.exports = {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch
};
