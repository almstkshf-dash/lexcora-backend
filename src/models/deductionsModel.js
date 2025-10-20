const db = require("../config/db");

const getAllDeductions = async (employeeId = null) => {
  let query = `
    SELECT 
      d.id,
      d.employee_id,
      d.date,
      d.amount,
      d.reason,
      d.created_at,
      e.name as employee_name,
      COALESCE(e.basic_salary, 0) + 
      COALESCE(e.housing_allowance, 0) + 
      COALESCE(e.trnsportation_allownce, 0) + 
      COALESCE(e.another_allownce, 0) as total_salary,
      cb.name as created_by_name
    FROM deductions d
    LEFT JOIN employees e ON d.employee_id = e.id
    LEFT JOIN employees cb ON d.created_by = cb.id
  `;
  
  const params = [];
  
  if (employeeId) {
    query += ` WHERE d.employee_id = ?`;
    params.push(employeeId);
  }
  
  query += ` ORDER BY d.date DESC, d.created_at DESC`;
  
  const [rows] = await db.query(query, params);
  return rows;
};

const getDeductionById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      d.id,
      d.employee_id,
      d.date,
      d.amount,
      d.reason,
      d.created_by,
      d.created_at,
      e.name as employee_name,
      COALESCE(e.basic_salary, 0) + 
      COALESCE(e.housing_allowance, 0) + 
      COALESCE(e.trnsportation_allownce, 0) + 
      COALESCE(e.another_allownce, 0) as total_salary,
      cb.name as created_by_name
    FROM deductions d
    LEFT JOIN employees e ON d.employee_id = e.id
    LEFT JOIN employees cb ON d.created_by = cb.id
    WHERE d.id = ?
  `, [id]);
  
  return rows[0] || null;
};

const createDeduction = async (deductionData) => {
  const { employee_id, date, amount, reason, created_by } = deductionData;
  
  const [result] = await db.query(
    `INSERT INTO deductions (employee_id, date, amount, reason, created_by) 
     VALUES (?, ?, ?, ?, ?)`,
    [employee_id, date, amount, reason, created_by]
  );
  
  return result.insertId;
};

const updateDeduction = async (id, deductionData) => {
  const { employee_id, date, amount, reason } = deductionData;
  
  const [result] = await db.query(
    `UPDATE deductions 
     SET employee_id = ?, date = ?, amount = ?, reason = ?
     WHERE id = ?`,
    [employee_id, date, amount, reason, id]
  );
  
  return result.affectedRows > 0;
};

const deleteDeduction = async (id) => {
  const [result] = await db.query(
    `DELETE FROM deductions WHERE id = ?`,
    [id]
  );
  
  return result.affectedRows > 0;
};

module.exports = {
  getAllDeductions,
  getDeductionById,
  createDeduction,
  updateDeduction,
  deleteDeduction
};
