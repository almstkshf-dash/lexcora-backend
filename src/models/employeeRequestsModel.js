const db = require("../config/db");

// Get all employee requests or by employee_id with pagination and filters
const getAllEmployeeRequests = async (filters = {}) => {
  const {
    employeeId = null,
    page = 1,
    limit = 20,
    managerApproval = null,
    hrApproval = null,
    type = null,
    search = null
  } = filters;

  // Base query
  let query = `
    SELECT 
      er.id,
      er.employee_id,
      er.date,
      er.type,
      er.from_date,
      er.to_date,
      er.manager_approval,
      er.hr_approval,
      er.created_by,
      er.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM employee_requests er
    LEFT JOIN employees e ON er.employee_id = e.id
    LEFT JOIN employees cb ON er.created_by = cb.id
  `;
  
  const params = [];
  const conditions = [];
  
  // Add filters
  if (employeeId) {
    conditions.push('er.employee_id = ?');
    params.push(employeeId);
  }

  if (managerApproval) {
    conditions.push('er.manager_approval = ?');
    params.push(managerApproval);
  }

  if (hrApproval) {
    conditions.push('er.hr_approval = ?');
    params.push(hrApproval);
  }

  if (type) {
    conditions.push('er.type = ?');
    params.push(type);
  }

  if (search) {
    conditions.push('(e.name LIKE ? OR er.type LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  // Apply WHERE conditions
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_requests`;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Add sorting and pagination
  query += ` ORDER BY er.date DESC, er.created_at DESC`;
  
  const offset = (page - 1) * limit;
  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  const [rows] = await db.query(query, params);
  
  return {
    data: rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Get employee request by ID
const getEmployeeRequestById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      er.id,
      er.employee_id,
      er.date,
      er.type,
      er.from_date,
      er.to_date,
      er.manager_approval,
      er.hr_approval,
      er.created_by,
      er.created_at,
      e.name as employee_name,
      cb.name as created_by_name
    FROM employee_requests er
    LEFT JOIN employees e ON er.employee_id = e.id
    LEFT JOIN employees cb ON er.created_by = cb.id
    WHERE er.id = ?
  `, [id]);
  
  return rows[0];
};

// Create employee request
const createEmployeeRequest = async (requestData) => {
  const {
    employee_id,
    date,
    type,
    from_date,
    to_date,
    created_by
  } = requestData;

  const [result] = await db.query(
    `INSERT INTO employee_requests 
      (employee_id, date, type, from_date, to_date, created_by) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [employee_id, date, type, from_date || null, to_date || null, created_by]
  );

  return result.insertId;
};

// Update employee request
const updateEmployeeRequest = async (id, requestData) => {
  const {
    date,
    type,
    from_date,
    to_date
  } = requestData;

  const [result] = await db.query(
    `UPDATE employee_requests 
    SET date = ?, type = ?, from_date = ?, to_date = ?
    WHERE id = ?`,
    [date, type, from_date || null, to_date || null, id]
  );

  return result.affectedRows;
};

// Update manager approval status
const updateManagerApproval = async (id, approval) => {
  const [result] = await db.query(
    `UPDATE employee_requests 
    SET manager_approval = ?
    WHERE id = ?`,
    [approval, id]
  );
  return result.affectedRows;
};

// Update HR approval status
const updateHrApproval = async (id, approval) => {
  const [result] = await db.query(
    `UPDATE employee_requests 
    SET hr_approval = ?
    WHERE id = ?`,
    [approval, id]
  );
  return result.affectedRows;
};

// Delete employee request
const deleteEmployeeRequest = async (id) => {
  const [result] = await db.query("DELETE FROM employee_requests WHERE id = ?", [id]);
  return result.affectedRows;
};

module.exports = {
  getAllEmployeeRequests,
  getEmployeeRequestById,
  createEmployeeRequest,
  updateEmployeeRequest,
  updateManagerApproval,
  updateHrApproval,
  deleteEmployeeRequest
};
