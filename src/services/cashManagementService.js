const db = require("../config/db");

/**
 * Generates a Cash Flow Tracking report.
 * Sums up all inflows and outflows across banks and petty cash.
 */
const getCashFlow = async (filters = {}) => {
  const { date_from, date_to, branch_id } = filters;
  
  let whereClause = "";
  let params = [];
  
  if (date_from && date_to) {
    whereClause = "WHERE created_at BETWEEN ? AND ?";
    params = [date_from, date_to];
  }

  // 1. Bank Inflows/Outflows
  const [bankFlow] = await db.query(`
    SELECT 
      SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END) as inflows,
      SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as outflows
    FROM bank_account_logs
    ${whereClause}
  `, params);

  // 2. Petty Cash Inflows/Outflows
  const [pettyFlow] = await db.query(`
    SELECT 
      SUM(CASE WHEN type = 'replenishment' THEN amount ELSE 0 END) as inflows,
      SUM(CASE WHEN type = 'disbursement' THEN amount ELSE 0 END) as outflows
    FROM petty_cash_transactions
    ${whereClause.replace('created_at', 'transaction_date')}
  `, params);

  // 3. Employee Cash Inflows/Outflows (Cash on hand)
  const [employeeFlow] = await db.query(`
    SELECT 
      SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as inflows,
      SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as outflows
    FROM employee_cash_transactions
    ${whereClause}
  `, params);

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
const getDailyCashFlow = async (days = 30) => {
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
      SELECT DATE(created_at) as date, amount as inflow, 0 as outflow FROM bank_account_logs WHERE type = 'deposit'
      UNION ALL
      SELECT DATE(created_at) as date, 0 as inflow, amount as outflow FROM bank_account_logs WHERE type = 'withdrawal'
      UNION ALL
      SELECT transaction_date as date, amount as inflow, 0 as outflow FROM petty_cash_transactions WHERE type = 'replenishment'
      UNION ALL
      SELECT transaction_date as date, 0 as inflow, amount as outflow FROM petty_cash_transactions WHERE type = 'disbursement'
    ) flows ON date_series.date = flows.date
    WHERE date_series.date > CURDATE() - INTERVAL ? DAY
    GROUP BY date_series.date
    ORDER BY date_series.date ASC
  `, [days]);
  
  return rows;
};

module.exports = {
  getCashFlow,
  getDailyCashFlow
};
