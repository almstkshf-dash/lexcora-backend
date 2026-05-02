const db = require("../config/db");

const getAllSalaries = async (filters = {}) => {
  const { employeeId, payPeriod, status, branchId } = filters;
  let query = `
    SELECT 
      s.*, 
      e.name as employee_name,
      e.job_id as employee_number,
      d.name_ar as department_ar,
      d.name_en as department_en
    FROM salaries s
    LEFT JOIN employees e ON s.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE 1=1
  `;
  const params = [];

  if (employeeId) {
    query += " AND s.employee_id = ?";
    params.push(employeeId);
  }
  if (payPeriod) {
    query += " AND s.pay_period = ?";
    params.push(payPeriod);
  }
  if (status) {
    query += " AND s.status = ?";
    params.push(status);
  }
  if (branchId) {
    query += " AND e.branch_id = ?";
    params.push(branchId);
  }

  query += " ORDER BY s.pay_period DESC, s.created_at DESC";

  const [rows] = await db.query(query, params);
  return rows;
};

const getSalaryById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      s.*, 
      e.name as employee_name,
      e.job_id as employee_number,
      e.iban,
      e.bank_name,
      e.account_number
    FROM salaries s
    LEFT JOIN employees e ON s.employee_id = e.id
    WHERE s.id = ?
  `, [id]);
  return rows[0];
};

const createSalary = async (salaryData) => {
  const {
    employee_id,
    base_salary,
    allowances = 0,
    deductions = 0,
    incentives = 0,
    bonuses = 0,
    eos_amount = 0,
    housing_allowance = 0,
    transportation_allowance = 0,
    other_allowance = 0,
    overtime_hours = 0,
    overtime_rate = 0,
    overtime_amount = 0,
    net_salary,
    pay_period,
    status = 'pending',
    notes = ''
  } = salaryData;

  const [result] = await db.query(`
    INSERT INTO salaries (
      employee_id, base_salary, allowances, deductions, 
      incentives, bonuses, eos_amount, 
      housing_allowance, transportation_allowance, other_allowance,
      overtime_hours, overtime_rate, overtime_amount,
      net_salary, pay_period, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    employee_id, base_salary, allowances, deductions,
    incentives, bonuses, eos_amount,
    housing_allowance, transportation_allowance, other_allowance,
    overtime_hours, overtime_rate, overtime_amount,
    net_salary, pay_period, status, notes
  ]);

  return result.insertId;
};

const updateSalary = async (id, salaryData) => {
  const fields = [];
  const params = [];

  Object.keys(salaryData).forEach(key => {
    if (key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
      fields.push(`${key} = ?`);
      params.push(salaryData[key]);
    }
  });

  if (fields.length === 0) return false;

  params.push(id);
  const [result] = await db.query(`
    UPDATE salaries SET ${fields.join(', ')} WHERE id = ?
  `, params);

  return result.affectedRows > 0;
};

const deleteSalary = async (id) => {
  const [result] = await db.query("DELETE FROM salaries WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllSalaries,
  getSalaryById,
  createSalary,
  updateSalary,
  deleteSalary
};
实现 net_salary // Typo fix needed in next turn or script
