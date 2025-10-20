const db = require("../config/db");

const getAllDepartments = async () => {
  const [rows] = await db.query(`SELECT * FROM departments`);
  return { success: true, data: rows };
};

const createDepartment = async (department) => {
  const { name_ar, name_en } = department;
  const [result] = await db.query(`
    INSERT INTO departments (name_ar, name_en) VALUES (?, ?)
  `, [name_ar, name_en]);
  return result.insertId;
};

const updateDepartment = async (id, department) => {
  const { name_ar, name_en } = department;
  const [result] = await db.query(` 
    UPDATE departments SET name_ar = ?, name_en = ? WHERE id = ?
  `, [name_ar, name_en, id]);
  return result.affectedRows > 0;
};  

const deleteDepartment = async (id) => {
  const [result] = await db.query("DELETE FROM departments WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getDepartmentById = async (id) => {
  const [rows] = await db.query("SELECT * FROM departments WHERE id = ?", [id]);
  return rows[0];
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentById
};