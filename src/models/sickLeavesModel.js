const db = require("../config/db");

const getAllSickLeaves = async (employeeId = null) => {
  let query = `
    SELECT 
      sl.id,
      sl.employee_id,
      sl.date,
      sl.from_date,
      sl.to_date,
      sl.total_days,
      sl.remaining_days,
      sl.leave_type,
      sl.created_by,
      sl.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM sick_leaves sl
    LEFT JOIN employees e ON sl.employee_id = e.id
    LEFT JOIN employees cb ON sl.created_by = cb.id
  `;
  
  const params = [];
  
  if (employeeId) {
    query += ` WHERE sl.employee_id = ?`;
    params.push(employeeId);
  }
  
  query += ` ORDER BY sl.date DESC, sl.created_at DESC`;
  
  const [rows] = await db.query(query, params);
  return rows;
};

const getSickLeaveById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      sl.id,
      sl.employee_id,
      sl.date,
      sl.from_date,
      sl.to_date,
      sl.total_days,
      sl.remaining_days,
      sl.leave_type,
      sl.created_by,
      sl.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM sick_leaves sl
    LEFT JOIN employees e ON sl.employee_id = e.id
    LEFT JOIN employees cb ON sl.created_by = cb.id
    WHERE sl.id = ?
  `, [id]);
  
  return rows[0];
};

const createSickLeave = async (sickLeaveData) => {
  const {
    employee_id,
    date,
    from_date,
    to_date,
    total_days,
    remaining_days,
    leave_type,
    created_by
  } = sickLeaveData;

  const [result] = await db.query(
    `INSERT INTO sick_leaves 
      (employee_id, date, from_date, to_date, total_days, remaining_days, leave_type, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [employee_id, date, from_date, to_date, total_days, remaining_days, leave_type, created_by]
  );

  return result.insertId;
};

const updateSickLeave = async (id, sickLeaveData) => {
  const {
    date,
    from_date,
    to_date,
    total_days,
    remaining_days,
    leave_type
  } = sickLeaveData;

  const [result] = await db.query(
    `UPDATE sick_leaves 
    SET date = ?, from_date = ?, to_date = ?, total_days = ?, remaining_days = ?, leave_type = ?
    WHERE id = ?`,
    [date, from_date, to_date, total_days, remaining_days, leave_type, id]
  );

  return result.affectedRows;
};

const deleteSickLeave = async (id) => {
  const [result] = await db.query("DELETE FROM sick_leaves WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = {
  getAllSickLeaves,
  getSickLeaveById,
  createSickLeave,
  updateSickLeave,
  deleteSickLeave
};
