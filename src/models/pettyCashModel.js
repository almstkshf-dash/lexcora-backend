const db = require("../config/db");

const normalizeNullableInt = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeAmount = (value, fallback = 0) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

/**
 * Petty Cash Funds
 */
const getAllFunds = async (branchId = null) => {
  let query = "SELECT pcf.*, pcf.current_balance as balance, e.name as responsible_employee_name, b.name_en as branch_name FROM petty_cash_funds pcf LEFT JOIN employees e ON pcf.responsible_employee_id = e.id LEFT JOIN branches b ON pcf.branch_id = b.id";
  let params = [];
  
  if (branchId) {
    query += " WHERE pcf.branch_id = ?";
    params.push(branchId);
  }
  
  const [rows] = await db.query(query, params);
  return rows;
};

const getFundById = async (id) => {
  const [rows] = await db.query(
    "SELECT pcf.*, e.name as responsible_employee_name FROM petty_cash_funds pcf LEFT JOIN employees e ON pcf.responsible_employee_id = e.id WHERE pcf.id = ?",
    [id]
  );
  return rows[0];
};

const createFund = async (fundData) => {
  const {
    name,
    branch_id,
    responsible_employee_id,
    limit_amount,
    initial_balance,
    created_by
  } = fundData;

  const normalizedName = typeof name === "string" ? name.trim() : "";
  if (!normalizedName) {
    throw new Error("Fund name is required");
  }

  const normalizedBranchId = normalizeNullableInt(branch_id);
  const normalizedResponsibleEmployeeId = normalizeNullableInt(responsible_employee_id);
  const normalizedLimitAmount = normalizeAmount(limit_amount, 0);
  const normalizedInitialBalance = normalizeAmount(initial_balance, 0);

  const [result] = await db.query(
    `INSERT INTO petty_cash_funds 
    (name, branch_id, responsible_employee_id, limit_amount, current_balance, created_by) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      normalizedName,
      normalizedBranchId,
      normalizedResponsibleEmployeeId,
      normalizedLimitAmount,
      normalizedInitialBalance,
      created_by
    ]
  );
  return result.insertId;
};

/**
 * Petty Cash Transactions
 */
const createTransaction = async (transactionData) => {
  const { fund_id, transaction_date, amount, type, description, reference_number, created_by } = transactionData;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // If disbursement, check if enough balance
    if (type === 'disbursement') {
      const [fund] = await connection.query("SELECT current_balance FROM petty_cash_funds WHERE id = ?", [fund_id]);
      if (!fund.length || fund[0].current_balance < amount) {
        throw new Error("Insufficient balance in petty cash fund");
      }
    }

    // Insert transaction
    const [result] = await connection.query(
      "INSERT INTO petty_cash_transactions (fund_id, transaction_date, amount, type, description, reference_number, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [fund_id, transaction_date, amount, type, description, reference_number, created_by]
    );
    
    // Update fund balance
    const balanceAdjustment = type === 'replenishment' ? amount : -amount;
    await connection.query(
      "UPDATE petty_cash_funds SET current_balance = current_balance + ? WHERE id = ?",
      [balanceAdjustment, fund_id]
    );
    
    await connection.commit();
    return { success: true, id: result.insertId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getFundTransactions = async (fundId, filters = {}) => {
  const { date_from, date_to } = filters;
  let query = "SELECT pct.*, pct.transaction_date as date, e.name as created_by_name FROM petty_cash_transactions pct LEFT JOIN employees e ON pct.created_by = e.id WHERE pct.fund_id = ?";
  let params = [fundId];
  
  if (date_from) {
    query += " AND pct.transaction_date >= ?";
    params.push(date_from);
  }
  if (date_to) {
    query += " AND pct.transaction_date <= ?";
    params.push(date_to);
  }
  
  query += " ORDER BY pct.transaction_date DESC, pct.id DESC";
  
  const [rows] = await db.query(query, params);
  return rows;
};

module.exports = {
  getAllFunds,
  getFundById,
  createFund,
  createTransaction,
  getFundTransactions
};
