const db = require("../config/db");

const getAllOtherLeaves = async (employeeId = null, { page, limit, sortBy, sortOrder }) => {
  const offset = (page - 1) * limit;
  const allowedSort = ['date', 'created_at', 'id'];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : 'date';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  let baseQuery = `
    FROM other_leaves ol
    LEFT JOIN employees e ON ol.employee_id = e.id
    LEFT JOIN employees cb ON ol.created_by = cb.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (employeeId) {
    conditions.push(`ol.employee_id = ?`);
    params.push(employeeId);
  }
  
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const [countRows] = await db.query(`SELECT COUNT(*) as total ${baseQuery} ${whereClause}`, params);
  const total = countRows[0]?.total || 0;
  
  const [rows] = await db.query(
    `
    SELECT 
      ol.id,
      ol.employee_id,
      ol.date,
      ol.from_date,
      ol.to_date,
      ol.total_days,
      ol.remaining_days,
      ol.leave_reason,
      ol.leave_type,
      ol.created_by,
      ol.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    ${baseQuery}
    ${whereClause}
    ORDER BY ol.${orderBy} ${orderDir}, ol.created_at ${orderDir}
    LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );
  return { rows, total };
};

const getOtherLeaveById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      ol.id,
      ol.employee_id,
      ol.date,
      ol.from_date,
      ol.to_date,
      ol.total_days,
      ol.remaining_days,
      ol.leave_reason,
      ol.leave_type,
      ol.created_by,
      ol.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM other_leaves ol
    LEFT JOIN employees e ON ol.employee_id = e.id
    LEFT JOIN employees cb ON ol.created_by = cb.id
    WHERE ol.id = ?
  `, [id]);
  
  return rows[0];
};

const createOtherLeave = async (otherLeaveData) => {
  const {
    employee_id,
    date,
    from_date,
    to_date,
    total_days,
    remaining_days,
    leave_reason,
    leave_type,
    created_by
  } = otherLeaveData;

  const [result] = await db.query(
    `INSERT INTO other_leaves 
      (employee_id, date, from_date, to_date, total_days, remaining_days, leave_reason, leave_type, created_by) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [employee_id, date, from_date, to_date, total_days, remaining_days, leave_reason, leave_type, created_by]
  );

  return result.insertId;
};

const updateOtherLeave = async (id, otherLeaveData) => {
  const {
    date,
    from_date,
    to_date,
    total_days,
    remaining_days,
    leave_reason,
    leave_type
  } = otherLeaveData;

  const [result] = await db.query(
    `UPDATE other_leaves 
    SET date = ?, from_date = ?, to_date = ?, total_days = ?, remaining_days = ?, leave_reason = ?, leave_type = ?
    WHERE id = ?`,
    [date, from_date, to_date, total_days, remaining_days, leave_reason, leave_type, id]
  );

  return result.affectedRows;
};

const deleteOtherLeave = async (id) => {
  const [result] = await db.query("DELETE FROM other_leaves WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = {
  getAllOtherLeaves,
  getOtherLeaveById,
  createOtherLeave,
  updateOtherLeave,
  deleteOtherLeave
};
