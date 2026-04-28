const db = require("../config/db");

const clampDays = (daysInput) => {
  const parsed = Number.parseInt(daysInput, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 30;
  return Math.min(parsed, 365);
};

/**
 * Generates a Cash Flow Tracking report.
 * Sums up all inflows and outflows across banks and petty cash.
 */
const getCashFlow = async (filters = {}) => {
  const { date_from, date_to, branch_id } = filters;
  const hasBranchFilter = branch_id !== undefined && branch_id !== null && branch_id !== "";

  const dateRangeParams = [];
  const bankConditions = [];
  const pettyConditions = [];
  const employeeConditions = [];

  if (date_from) {
    bankConditions.push("DATE(bal.created_at) >= ?");
    pettyConditions.push("pct.transaction_date >= ?");
    employeeConditions.push("DATE(ect.created_at) >= ?");
    dateRangeParams.push(date_from);
  }

  if (date_to) {
    bankConditions.push("DATE(bal.created_at) <= ?");
    pettyConditions.push("pct.transaction_date <= ?");
    employeeConditions.push("DATE(ect.created_at) <= ?");
    dateRangeParams.push(date_to);
  }

  if (hasBranchFilter) {
    bankConditions.push("ba.branch_id = ?");
    pettyConditions.push("pcf.branch_id = ?");
    employeeConditions.push("e.branch_id = ?");
  }

  const bankWhereClause = bankConditions.length > 0 ? `WHERE ${bankConditions.join(" AND ")}` : "";
  const pettyWhereClause = pettyConditions.length > 0 ? `WHERE ${pettyConditions.join(" AND ")}` : "";
  const employeeWhereClause = employeeConditions.length > 0 ? `WHERE ${employeeConditions.join(" AND ")}` : "";
  const bankParams = hasBranchFilter ? [...dateRangeParams, branch_id] : [...dateRangeParams];
  const pettyParams = hasBranchFilter ? [...dateRangeParams, branch_id] : [...dateRangeParams];
  const employeeParams = hasBranchFilter ? [...dateRangeParams, branch_id] : [...dateRangeParams];

  // 1. Bank Inflows/Outflows
  const [bankFlow] = await db.query(`
    SELECT 
      SUM(CASE WHEN bal.type = 'deposit' THEN bal.amount ELSE 0 END) as inflows,
      SUM(CASE WHEN bal.type = 'withdrawal' THEN bal.amount ELSE 0 END) as outflows
    FROM bank_account_logs bal
    LEFT JOIN bank_accounts ba ON ba.id = bal.bank_account_id
    ${bankWhereClause}
  `, bankParams);

  // 2. Petty Cash Inflows/Outflows
  const [pettyFlow] = await db.query(`
    SELECT 
      SUM(CASE WHEN pct.type = 'replenishment' THEN pct.amount ELSE 0 END) as inflows,
      SUM(CASE WHEN pct.type = 'disbursement' THEN pct.amount ELSE 0 END) as outflows
    FROM petty_cash_transactions pct
    LEFT JOIN petty_cash_funds pcf ON pcf.id = pct.fund_id
    ${pettyWhereClause}
  `, pettyParams);

  // 3. Employee Cash Inflows/Outflows (Cash on hand)
  const [employeeFlow] = await db.query(`
    SELECT 
      SUM(CASE WHEN ect.type = 'credit' THEN ect.amount ELSE 0 END) as inflows,
      SUM(CASE WHEN ect.type = 'debit' THEN ect.amount ELSE 0 END) as outflows
    FROM employee_cash_transactions ect
    LEFT JOIN employees e ON e.id = ect.employee_id
    ${employeeWhereClause}
  `, employeeParams);

  const totalInflows = (parseFloat(bankFlow[0].inflows) || 0) + 
                       (parseFloat(pettyFlow[0].inflows) || 0) + 
                       (parseFloat(employeeFlow[0].inflows) || 0);
                       
  const totalOutflows = (parseFloat(bankFlow[0].outflows) || 0) + 
                        (parseFloat(pettyFlow[0].outflows) || 0) + 
                        (parseFloat(employeeFlow[0].outflows) || 0);

  return {
    summary: {
      totalInflows,
      totalOutflows,
      netCashFlow: totalInflows - totalOutflows
    },
    details: {
      bank: bankFlow[0],
      pettyCash: pettyFlow[0],
      employeeCash: employeeFlow[0]
    }
  };
};

/**
 * Gets daily cash flow for chart representation.
 */
const getDailyCashFlow = async (filters = {}) => {
  const { days = 30, branch_id } = filters || {};
  const safeDays = clampDays(days);
  const hasBranchFilter = branch_id !== undefined && branch_id !== null && branch_id !== "";
  const branchPredicate = hasBranchFilter ? " AND flows.branch_id = ?" : "";
  const params = hasBranchFilter ? [safeDays, branch_id] : [safeDays];

  const [rows] = await db.query(`
    SELECT 
      date_series.date,
      COALESCE(SUM(flows.inflow), 0) as total_inflow,
      COALESCE(SUM(flows.outflow), 0) as total_outflow
    FROM (
      SELECT CURDATE() - INTERVAL (a.a + (10 * b.a) + (100 * c.a)) DAY as date
      FROM (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as a
      CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as b
      CROSS JOIN (SELECT 0 as a UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) as c
    ) date_series
    LEFT JOIN (
      SELECT DATE(bal.created_at) as date, bal.amount as inflow, 0 as outflow, ba.branch_id
      FROM bank_account_logs bal
      LEFT JOIN bank_accounts ba ON ba.id = bal.bank_account_id
      WHERE bal.type = 'deposit'
      UNION ALL
      SELECT DATE(bal.created_at) as date, 0 as inflow, bal.amount as outflow, ba.branch_id
      FROM bank_account_logs bal
      LEFT JOIN bank_accounts ba ON ba.id = bal.bank_account_id
      WHERE bal.type = 'withdrawal'
      UNION ALL
      SELECT pct.transaction_date as date, pct.amount as inflow, 0 as outflow, pcf.branch_id
      FROM petty_cash_transactions pct
      LEFT JOIN petty_cash_funds pcf ON pcf.id = pct.fund_id
      WHERE pct.type = 'replenishment'
      UNION ALL
      SELECT pct.transaction_date as date, 0 as inflow, pct.amount as outflow, pcf.branch_id
      FROM petty_cash_transactions pct
      LEFT JOIN petty_cash_funds pcf ON pcf.id = pct.fund_id
      WHERE pct.type = 'disbursement'
      UNION ALL
      SELECT DATE(ect.created_at) as date, ect.amount as inflow, 0 as outflow, e.branch_id
      FROM employee_cash_transactions ect
      LEFT JOIN employees e ON e.id = ect.employee_id
      WHERE ect.type = 'credit'
      UNION ALL
      SELECT DATE(ect.created_at) as date, 0 as inflow, ect.amount as outflow, e.branch_id
      FROM employee_cash_transactions ect
      LEFT JOIN employees e ON e.id = ect.employee_id
      WHERE ect.type = 'debit'
    ) flows ON date_series.date = flows.date
    WHERE date_series.date >= CURDATE() - INTERVAL ? DAY
      ${branchPredicate}
    GROUP BY date_series.date
    ORDER BY date_series.date ASC
  `, params);
  
  return rows;
};

module.exports = {
  getCashFlow,
  getDailyCashFlow
};
