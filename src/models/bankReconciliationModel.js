const db = require("../config/db");

/**
 * Bank Statement Imports
 */
const createImport = async (importData) => {
  const { bank_account_id, filename, file_url, created_by } = importData;
  const [result] = await db.query(
    "INSERT INTO bank_statement_imports (bank_account_id, filename, file_url, created_by) VALUES (?, ?, ?, ?)",
    [bank_account_id, filename, file_url, created_by]
  );
  return result.insertId;
};

const updateImportStatus = async (id, status) => {
  await db.query("UPDATE bank_statement_imports SET status = ? WHERE id = ?", [status, id]);
};

/**
 * Bank Statement Lines
 */
const createStatementLines = async (lines) => {
  const query = "INSERT INTO bank_statement_lines (import_id, transaction_date, description, amount, reference, fitid) VALUES ?";
  const values = lines.map(line => [
    line.import_id,
    line.transaction_date,
    line.description,
    line.amount,
    line.reference,
    line.fitid
  ]);
  const [result] = await db.query(query, [values]);
  return result.affectedRows;
};

const getUnreconciledLines = async (bankAccountId) => {
  const [rows] = await db.query(`
    SELECT bsl.* 
    FROM bank_statement_lines bsl
    JOIN bank_statement_imports bsi ON bsl.import_id = bsi.id
    WHERE bsi.bank_account_id = ? AND bsl.is_reconciled = 0
    ORDER BY bsl.transaction_date ASC
  `, [bankAccountId]);
  return rows;
};

/**
 * Reconciliation
 */
const reconcileTransaction = async (reconciliationData) => {
  const { bank_account_id, bank_statement_line_id, bank_account_log_id, reconciled_by } = reconciliationData;
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Create reconciliation record
    await connection.query(
      "INSERT INTO bank_reconciliations (bank_account_id, bank_statement_line_id, bank_account_log_id, reconciled_by) VALUES (?, ?, ?, ?)",
      [bank_account_id, bank_statement_line_id, bank_account_log_id, reconciled_by]
    );
    
    // Mark line as reconciled
    await connection.query("UPDATE bank_statement_lines SET is_reconciled = 1 WHERE id = ?", [bank_statement_line_id]);
    
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getReconciliationStatus = async (bankAccountId) => {
  const [rows] = await db.query(`
    SELECT 
      ba.current_balance as internal_balance,
      (SELECT SUM(amount) FROM bank_statement_lines bsl 
       JOIN bank_statement_imports bsi ON bsl.import_id = bsi.id 
       WHERE bsi.bank_account_id = ba.id) as statement_total,
      (SELECT COUNT(*) FROM bank_statement_lines bsl 
       JOIN bank_statement_imports bsi ON bsl.import_id = bsi.id 
       WHERE bsi.bank_account_id = ba.id AND bsl.is_reconciled = 0) as unreconciled_count
    FROM bank_accounts ba
    WHERE ba.id = ?
  `, [bankAccountId]);
  return rows[0];
};

module.exports = {
  createImport,
  updateImportStatus,
  createStatementLines,
  getUnreconciledLines,
  reconcileTransaction,
  getReconciliationStatus
};
