const db = require("../config/db");

// ─────────────────────────────────────────────────────────────────
// UAE Labor Law: default leave pay type per request type
// ─────────────────────────────────────────────────────────────────
const UAE_LEAVE_PAY_DEFAULTS = {
  'اجازة سنوية':                          'paid',
  'اجازة مرضية':                          'paid',    // first 15 days full pay (Federal Law 33/2021)
  'اجازة الوضع':                          'paid',    // 60 days maternity
  'اجازة الحداد':                         'paid',    // 5 days paid
  'اجازة التفرغ لإداء الخدمة الوطنية':   'paid',
  'اجازة الحج والعمرة':                   'paid',    // 30 days once
  'بدل اجازة سنوية':                      'paid',
  // Non-leave types have no financial leave impact by default
};

// Default Chart of Accounts mapping per leave type (account code → looked up on insert)
const LEAVE_ACCOUNT_CODES = {
  'اجازة سنوية':                          { debit: '5101', credit: '2201' },
  'اجازة مرضية':                          { debit: '5102', credit: '2200' },
  'اجازة الوضع':                          { debit: '5103', credit: '2200' },
  'اجازة الحداد':                         { debit: '5104', credit: '2200' },
  'اجازة التفرغ لإداء الخدمة الوطنية':   { debit: '5105', credit: '2200' },
  'اجازة الحج والعمرة':                   { debit: '5106', credit: '2200' },
  'بدل اجازة سنوية':                      { debit: '5110', credit: '2202' },
};

// ─────────────────────────────────────────────────────────────────
// Get all employee requests (with finance fields) + pagination
// ─────────────────────────────────────────────────────────────────
const getAllEmployeeRequests = async (filters = {}) => {
  const {
    employeeId = null,
    page = 1,
    limit = 20,
    managerApproval = null,
    hrApproval = null,
    financeApproval = null,
    type = null,
    search = null
  } = filters;

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
      er.finance_approval,
      er.finance_notes,
      er.finance_approved_by,
      er.finance_approved_at,
      er.leave_pay_type,
      er.days_count,
      er.daily_rate,
      er.leave_value_aed,
      er.account_id,
      er.contra_account_id,
      er.journal_entry_id,
      er.reason,
      er.notes,
      er.created_by,
      er.created_at,
      e.name  AS employee_name,
      e.base_salary,
      cb.name AS created_by_name,
      fb.name AS finance_approved_by_name,
      da.code  AS debit_account_code,
      da.name_en AS debit_account_name_en,
      da.name_ar AS debit_account_name_ar,
      ca.code  AS credit_account_code,
      ca.name_en AS credit_account_name_en,
      ca.name_ar AS credit_account_name_ar
    FROM employee_requests er
    LEFT JOIN employees e  ON er.employee_id        = e.id
    LEFT JOIN employees cb ON er.created_by         = cb.id
    LEFT JOIN employees fb ON er.finance_approved_by = fb.id
    LEFT JOIN accounts  da ON er.account_id         = da.id
    LEFT JOIN accounts  ca ON er.contra_account_id  = ca.id
  `;

  const params = [];
  const conditions = [];

  if (employeeId)      { conditions.push('er.employee_id = ?');       params.push(employeeId); }
  if (managerApproval) { conditions.push('er.manager_approval = ?');  params.push(managerApproval); }
  if (hrApproval)      { conditions.push('er.hr_approval = ?');       params.push(hrApproval); }
  if (financeApproval) { conditions.push('er.finance_approval = ?');  params.push(financeApproval); }
  if (type)            { conditions.push('er.type = ?');              params.push(type); }
  if (search)          { conditions.push('(e.name LIKE ? OR er.type LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  if (conditions.length > 0) query += ' WHERE ' + conditions.join(' AND ');

  const countQuery = `SELECT COUNT(*) as total FROM (${query}) as filtered_requests`;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

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

// ─────────────────────────────────────────────────────────────────
// Get single request by ID (with all finance details)
// ─────────────────────────────────────────────────────────────────
const getEmployeeRequestById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      er.*,
      e.name     AS employee_name,
      e.base_salary,
      cb.name    AS created_by_name,
      fb.name    AS finance_approved_by_name,
      da.code    AS debit_account_code,
      da.name_en AS debit_account_name_en,
      da.name_ar AS debit_account_name_ar,
      ca.code    AS credit_account_code,
      ca.name_en AS credit_account_name_en,
      ca.name_ar AS credit_account_name_ar
    FROM employee_requests er
    LEFT JOIN employees e  ON er.employee_id         = e.id
    LEFT JOIN employees cb ON er.created_by          = cb.id
    LEFT JOIN employees fb ON er.finance_approved_by = fb.id
    LEFT JOIN accounts  da ON er.account_id          = da.id
    LEFT JOIN accounts  ca ON er.contra_account_id   = ca.id
    WHERE er.id = ?
  `, [id]);

  return rows[0];
};

// ─────────────────────────────────────────────────────────────────
// Helper: resolve account IDs from codes
// ─────────────────────────────────────────────────────────────────
const resolveAccountIds = async (debitCode, creditCode) => {
  const [debitRows]  = await db.query('SELECT id FROM accounts WHERE code = ? LIMIT 1', [debitCode]);
  const [creditRows] = await db.query('SELECT id FROM accounts WHERE code = ? LIMIT 1', [creditCode]);
  return {
    account_id:        debitRows[0]?.id  || null,
    contra_account_id: creditRows[0]?.id || null,
  };
};

// ─────────────────────────────────────────────────────────────────
// Helper: calculate daily rate from monthly base salary
// UAE: daily_rate = base_salary / 30
// ─────────────────────────────────────────────────────────────────
const calcDailyRate = (base_salary) => {
  if (!base_salary || base_salary <= 0) return 0;
  return parseFloat((base_salary / 30).toFixed(2));
};

// ─────────────────────────────────────────────────────────────────
// Create employee request (auto-populates finance defaults)
// ─────────────────────────────────────────────────────────────────
const createEmployeeRequest = async (requestData) => {
  const {
    employee_id,
    date,
    type,
    from_date,
    to_date,
    reason = null,
    notes  = null,
    created_by,
    // Optional overrides (only allowed by authorized users)
    leave_pay_type: payTypeOverride,
    daily_rate:     dailyRateOverride,
    leave_value_aed: leaveValueOverride,
    account_id:     accountIdOverride,
    contra_account_id: contraIdOverride,
  } = requestData;

  // Calculate days_count
  let days_count = 0;
  if (from_date && to_date) {
    const diff = (new Date(to_date) - new Date(from_date)) / (1000 * 60 * 60 * 24);
    days_count = Math.max(0, diff + 1);
  }

  // Resolve leave_pay_type
  const leave_pay_type = payTypeOverride || UAE_LEAVE_PAY_DEFAULTS[type] || 'paid';

  // Resolve accounts from CoA defaults (then override if supplied)
  let account_id        = accountIdOverride  || null;
  let contra_account_id = contraIdOverride   || null;

  if (!account_id && LEAVE_ACCOUNT_CODES[type]) {
    const codes = LEAVE_ACCOUNT_CODES[type];
    const ids = await resolveAccountIds(codes.debit, codes.credit);
    account_id        = ids.account_id;
    contra_account_id = ids.contra_account_id;
  }

  // Fetch employee base_salary for daily_rate
  let daily_rate = dailyRateOverride || 0;
  if (!daily_rate && employee_id) {
    const [empRows] = await db.query('SELECT base_salary FROM employees WHERE id = ? LIMIT 1', [employee_id]);
    daily_rate = calcDailyRate(empRows[0]?.base_salary);
  }

  // Leave value (paid=full rate, unpaid=0, partial handled by override)
  let leave_value_aed = leaveValueOverride !== undefined ? leaveValueOverride : 0;
  if (leaveValueOverride === undefined) {
    leave_value_aed = leave_pay_type === 'paid'   ? parseFloat((daily_rate * days_count).toFixed(2))
                    : leave_pay_type === 'unpaid'  ? 0
                    : 0; // partial — must be set by finance
  }

  const [result] = await db.query(
    `INSERT INTO employee_requests 
      (employee_id, date, type, from_date, to_date, reason, notes,
       leave_pay_type, days_count, daily_rate, leave_value_aed,
       account_id, contra_account_id, finance_approval, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
    [
      employee_id, date, type,
      from_date || null, to_date || null,
      reason, notes,
      leave_pay_type, days_count, daily_rate, leave_value_aed,
      account_id, contra_account_id,
      created_by
    ]
  );

  return result.insertId;
};

// ─────────────────────────────────────────────────────────────────
// Update basic request fields
// ─────────────────────────────────────────────────────────────────
const updateEmployeeRequest = async (id, requestData) => {
  const { date, type, from_date, to_date, reason, notes } = requestData;

  const [result] = await db.query(
    `UPDATE employee_requests 
     SET date = ?, type = ?, from_date = ?, to_date = ?, reason = ?, notes = ?
     WHERE id = ?`,
    [date, type, from_date || null, to_date || null, reason || null, notes || null, id]
  );

  return result.affectedRows;
};

// ─────────────────────────────────────────────────────────────────
// Update financial values (requires authorized user — enforced in controller)
// ─────────────────────────────────────────────────────────────────
const updateLeaveFinancialValues = async (id, financialData) => {
  const {
    leave_pay_type,
    days_count,
    daily_rate,
    leave_value_aed,
    account_id,
    contra_account_id,
  } = financialData;

  const [result] = await db.query(
    `UPDATE employee_requests 
     SET leave_pay_type = ?, days_count = ?, daily_rate = ?,
         leave_value_aed = ?, account_id = ?, contra_account_id = ?
     WHERE id = ?`,
    [leave_pay_type, days_count, daily_rate, leave_value_aed,
     account_id || null, contra_account_id || null, id]
  );
  return result.affectedRows;
};

// ─────────────────────────────────────────────────────────────────
// Update manager approval
// ─────────────────────────────────────────────────────────────────
const updateManagerApproval = async (id, approval) => {
  const [result] = await db.query(
    `UPDATE employee_requests SET manager_approval = ? WHERE id = ?`,
    [approval, id]
  );
  return result.affectedRows;
};

// ─────────────────────────────────────────────────────────────────
// Update HR approval
// ─────────────────────────────────────────────────────────────────
const updateHrApproval = async (id, approval) => {
  const [result] = await db.query(
    `UPDATE employee_requests SET hr_approval = ? WHERE id = ?`,
    [approval, id]
  );
  return result.affectedRows;
};

// ─────────────────────────────────────────────────────────────────
// Update Finance approval (+ auto-create journal entry if approved)
// ─────────────────────────────────────────────────────────────────
const updateFinanceApproval = async (id, approval, notes, approvedBy, connection = null) => {
  const conn = connection || db;
  const [result] = await conn.query(
    `UPDATE employee_requests 
     SET finance_approval = ?, finance_notes = ?,
         finance_approved_by = ?, finance_approved_at = NOW()
     WHERE id = ?`,
    [approval, notes || null, approvedBy, id]
  );
  return result.affectedRows;
};

// ─────────────────────────────────────────────────────────────────
// Link journal entry to request
// ─────────────────────────────────────────────────────────────────
const linkJournalEntry = async (id, journalEntryId) => {
  const [result] = await db.query(
    `UPDATE employee_requests SET journal_entry_id = ? WHERE id = ?`,
    [journalEntryId, id]
  );
  return result.affectedRows;
};

// ─────────────────────────────────────────────────────────────────
// Delete request
// ─────────────────────────────────────────────────────────────────
const deleteEmployeeRequest = async (id) => {
  const [result] = await db.query("DELETE FROM employee_requests WHERE id = ?", [id]);
  return result.affectedRows;
};

// ─────────────────────────────────────────────────────────────────
// Finance summary: aggregate HR leave costs per period
// ─────────────────────────────────────────────────────────────────
const getHRFinanceSummary = async (filters = {}) => {
  const { start_date, end_date, department_id } = filters;

  let query = `
    SELECT
      er.type,
      er.leave_pay_type,
      COUNT(*)                 AS total_requests,
      SUM(er.days_count)       AS total_days,
      SUM(er.leave_value_aed)  AS total_cost_aed,
      er.finance_approval
    FROM employee_requests er
    LEFT JOIN employees e ON er.employee_id = e.id
    WHERE er.leave_value_aed > 0
  `;
  const params = [];

  if (start_date) { query += ' AND er.date >= ?'; params.push(start_date); }
  if (end_date)   { query += ' AND er.date <= ?'; params.push(end_date); }
  if (department_id) { query += ' AND e.department_id = ?'; params.push(department_id); }

  query += ' GROUP BY er.type, er.leave_pay_type, er.finance_approval ORDER BY total_cost_aed DESC';

  const [rows] = await db.query(query, params);
  return rows;
};

module.exports = {
  getAllEmployeeRequests,
  getEmployeeRequestById,
  createEmployeeRequest,
  updateEmployeeRequest,
  updateLeaveFinancialValues,
  updateManagerApproval,
  updateHrApproval,
  updateFinanceApproval,
  linkJournalEntry,
  deleteEmployeeRequest,
  getHRFinanceSummary,
  UAE_LEAVE_PAY_DEFAULTS,
  LEAVE_ACCOUNT_CODES,
};
