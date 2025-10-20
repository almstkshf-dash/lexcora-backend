const db = require("../config/db");

const getAllPublicProsecutions = async () => {
  const [rows] = await db.query(`SELECT * FROM public_prosecutions`);
  return rows;
};

const createPublicProsecution = async (prosecution) => {
  const { name_ar, name_en } = prosecution;
  const [result] = await db.query(`
    INSERT INTO public_prosecutions (name_ar, name_en) VALUES (?, ?)
  `, [name_ar, name_en]);
  return result.insertId;
};

const updatePublicProsecution = async (id, prosecution) => {
  const { name_ar, name_en } = prosecution;
  const [result] = await db.query(` 
    UPDATE public_prosecutions SET name_ar = ?, name_en = ? WHERE id = ?
  `, [name_ar, name_en, id]);
  return result.affectedRows > 0;
};  

const deletePublicProsecution = async (id) => {
  const [result] = await db.query("DELETE FROM public_prosecutions WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllPublicProsecutions,
  createPublicProsecution,
  updatePublicProsecution,
  deletePublicProsecution
};