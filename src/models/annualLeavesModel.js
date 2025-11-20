const db = require("../config/db");

const getAllAnnualLeaves = async (employeeId = null, { page, limit, sortBy, sortOrder }) => {
  const offset = (page - 1) * limit;
  const allowedSort = ['date', 'created_at', 'id'];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : 'date';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  let baseQuery = `
    FROM annual_leaves al
    LEFT JOIN employees e ON al.employee_id = e.id
    LEFT JOIN employees cb ON al.created_by = cb.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (employeeId) {
    conditions.push(`al.employee_id = ?`);
    params.push(employeeId);
  }
  
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const [countRows] = await db.query(`SELECT COUNT(*) as total ${baseQuery} ${whereClause}`, params);
  const total = countRows[0]?.total || 0;
  
  const [rows] = await db.query(
    `
    SELECT 
      al.id,
      al.employee_id,
      al.date,
      al.from_date,
      al.to_date,
      al.total_days,
      al.remaining_days,
      al.leave_type,
      al.created_by,
      al.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    ${baseQuery}
    ${whereClause}
    ORDER BY al.${orderBy} ${orderDir}, al.created_at ${orderDir}
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );
  return { rows, total };
};

const getAnnualLeaveById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      al.id,
      al.employee_id,
      al.date,
      al.from_date,
      al.to_date,
      al.total_days,
      al.remaining_days,
      al.leave_type,
      al.created_by,
      al.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM annual_leaves al
    LEFT JOIN employees e ON al.employee_id = e.id
    LEFT JOIN employees cb ON al.created_by = cb.id
    WHERE al.id = ?
  `, [id]);
  
  return rows[0];
};

const createAnnualLeave = async (annualLeaveData) => {
  const {
    employee_id,
    date,
    from_date,
    to_date,
    total_days,
    remaining_days,
    leave_type,
    created_by
  } = annualLeaveData;

  const [result] = await db.query(
    `INSERT INTO annual_leaves 
      (employee_id, date, from_date, to_date, total_days, remaining_days, leave_type, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [employee_id, date, from_date, to_date, total_days, remaining_days, leave_type, created_by]
  );

  return result.insertId;
};

const updateAnnualLeave = async (id, annualLeaveData) => {
  const {
    date,
    from_date,
    to_date,
    total_days,
    remaining_days,
    leave_type
  } = annualLeaveData;

  const [result] = await db.query(
    `UPDATE annual_leaves 
    SET date = ?, from_date = ?, to_date = ?, total_days = ?, remaining_days = ?, leave_type = ?
    WHERE id = ?`,
    [date, from_date, to_date, total_days, remaining_days, leave_type, id]
  );

  return result.affectedRows;
};

const deleteAnnualLeave = async (id) => {
  const [result] = await db.query("DELETE FROM annual_leaves WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = {
  getAllAnnualLeaves,
  getAnnualLeaveById,
  createAnnualLeave,
  updateAnnualLeave,
  deleteAnnualLeave
};
