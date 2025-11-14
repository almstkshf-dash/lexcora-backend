const db = require("../config/db");

const getAllBankAccounts = async () => {
  const [rows] = await db.query(`
    SELECT 
      ba.id,
      ba.bank_name,
      ba.account_name,
      ba.account_number,
      ba.iban,
      ba.branch_id,
      ba.current_balance,
      ba.status,
      ba.created_by,
      ba.created_at,
      b.name_ar as branch_name_ar,
      b.name_en as branch_name_en,
      e.name as created_by_name
    FROM bank_accounts ba
    LEFT JOIN branches b ON ba.branch_id = b.id
    LEFT JOIN employees e ON ba.created_by = e.id
    ORDER BY ba.created_at DESC
  `);
  return { success: true, data: rows };
};

const getBankAccountById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      ba.id,
      ba.bank_name,
      ba.account_name,
      ba.account_number,
      ba.iban,
      ba.branch_id,
      ba.current_balance,
      ba.status,
      ba.created_by,
      ba.created_at,
      b.name_ar as branch_name_ar,
      b.name_en as branch_name_en,
      e.name as created_by_name
    FROM bank_accounts ba
    LEFT JOIN branches b ON ba.branch_id = b.id
    LEFT JOIN employees e ON ba.created_by = e.id
    WHERE ba.id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return { success: false, message: 'Bank account not found' };
  }
  
  return { success: true, data: rows[0] };
};

const createBankAccount = async (bankAccount) => {
  const { 
    bank_name, 
    account_name, 
    account_number, 
    iban, 
    branch_id, 
    current_balance = 0, 
    status = 'active',
    created_by 
  } = bankAccount;
  
  try {
    const [result] = await db.query(`
      INSERT INTO bank_accounts 
      (bank_name, account_name, account_number, iban, branch_id, current_balance, status, created_by, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [bank_name, account_name, account_number, iban, branch_id, current_balance, status, created_by]);
    
    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error("Error inserting bank account:", error);
    return { success: false, message: error.message };
  }
};

const updateBankAccount = async (id, bankAccount) => {
  const { 
    bank_name, 
    account_name, 
    account_number, 
    iban, 
    branch_id, 
    current_balance, 
    status 
  } = bankAccount;
  
  try {
    const [result] = await db.query(`
      UPDATE bank_accounts 
      SET bank_name = ?, 
          account_name = ?, 
          account_number = ?, 
          iban = ?, 
          branch_id = ?, 
          current_balance = ?, 
          status = ?
      WHERE id = ?
    `, [bank_name, account_name, account_number, iban, branch_id, current_balance, status, id]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Bank account not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating bank account:", error);
    return { success: false, message: error.message };
  }
};

const deleteBankAccount = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM bank_accounts WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Bank account not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting bank account:", error);
    return { success: false, message: error.message };
  }
};

const updateAccountBalance = async (id, amount, operation = 'add') => {
  try {
    // SECURITY: Whitelist allowed operations to prevent SQL injection
    if (operation !== 'add' && operation !== 'subtract') {
      throw new Error('Invalid operation. Must be "add" or "subtract"');
    }
    
    const operator = operation === 'add' ? '+' : '-';
    const [result] = await db.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance ${operator} ?
      WHERE id = ?
    `, [amount, id]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Bank account not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating account balance:", error);
    return { success: false, message: error.message };
  }
};

const getBankAccountLogs = async (bankAccountId) => {
  try {
    const [logs] = await db.query(`
      SELECT 
        bal.id,
        bal.bank_account_id,
        bal.type,
        bal.amount,
        bal.description,
        bal.created_by,
        bal.created_at,
        e.name as employee_name
      FROM bank_account_logs bal
      LEFT JOIN employees e ON bal.created_by = e.id
      WHERE bal.bank_account_id = ?
      ORDER BY bal.created_at DESC
    `, [bankAccountId]);
    
    // Get attachments for each log
    for (let log of logs) {
      const [attachments] = await db.query(`
        SELECT 
          id,
          log_id,
          document_name,
          document_url,
          uploaded_at
        FROM bank_account_log_attachments
        WHERE log_id = ?
        ORDER BY uploaded_at ASC
      `, [log.id]);
      
      log.attachments = attachments;
    }
    
    return { success: true, data: logs };
  } catch (error) {
    console.error("Error fetching bank account logs:", error);
    return { success: false, message: error.message };
  }
};

const createBankAccountLog = async (logData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { bank_account_id, type, amount, description, created_by, attachments = [] } = logData;
    
    // Insert the log
    const [logResult] = await connection.query(`
      INSERT INTO bank_account_logs 
      (bank_account_id, type, amount, description, created_by, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [bank_account_id, type, amount, description, created_by]);
    
    const logId = logResult.insertId;
    
    // Update bank account balance
    const operator = type === 'deposit' ? '+' : '-';
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance ${operator} ?
      WHERE id = ?
    `, [amount, bank_account_id]);
    
    // Insert attachments if any
    if (attachments && attachments.length > 0) {
      for (const file of attachments) {
        await connection.query(`
          INSERT INTO bank_account_log_attachments 
          (log_id, document_name, document_url, uploaded_at) 
          VALUES (?, ?, ?, NOW())
        `, [logId, file.originalname, file.location || file.path]);
      }
    }
    
    await connection.commit();
    
    return { success: true, data: { id: logId } };
  } catch (error) {
    await connection.rollback();
    console.error("Error creating bank account log:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const updateBankAccountLog = async (logId, updateData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get the old log data to calculate balance difference
    const [oldLogData] = await connection.query(
      'SELECT bank_account_id, type, amount FROM bank_account_logs WHERE id = ?',
      [logId]
    );
    
    if (oldLogData.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Log not found' };
    }
    
    const oldLog = oldLogData[0];
    const { type, amount, description, new_attachments = [], delete_attachments = [] } = updateData;
    
    // Update the log
    await connection.query(`
      UPDATE bank_account_logs 
      SET type = ?, amount = ?, description = ?
      WHERE id = ?
    `, [type, amount, description, logId]);
    
    // Calculate balance adjustment
    // First, reverse the old transaction
    const oldOperator = oldLog.type === 'deposit' ? '-' : '+';
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance ${oldOperator} ?
      WHERE id = ?
    `, [oldLog.amount, oldLog.bank_account_id]);
    
    // Then apply the new transaction
    const newOperator = type === 'deposit' ? '+' : '-';
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance ${newOperator} ?
      WHERE id = ?
    `, [amount, oldLog.bank_account_id]);
    
    // Delete specified attachments
    if (delete_attachments.length > 0) {
      await connection.query(
        'DELETE FROM bank_account_log_attachments WHERE id IN (?)',
        [delete_attachments]
      );
    }
    
    // Add new attachments
    if (new_attachments.length > 0) {
      for (const file of new_attachments) {
        await connection.query(`
          INSERT INTO bank_account_log_attachments 
          (log_id, document_name, document_url, uploaded_at) 
          VALUES (?, ?, ?, NOW())
        `, [logId, file.originalname, file.location]);
      }
    }
    
    await connection.commit();
    
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error updating bank account log:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const deleteBankAccountLog = async (logId) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get log data to reverse the balance change
    const [logData] = await connection.query(
      'SELECT bank_account_id, type, amount FROM bank_account_logs WHERE id = ?',
      [logId]
    );
    
    if (logData.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Log not found' };
    }
    
    const log = logData[0];
    
    // Reverse the balance change
    const operator = log.type === 'deposit' ? '-' : '+';
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance ${operator} ?
      WHERE id = ?
    `, [log.amount, log.bank_account_id]);
    
    // Delete attachments (will cascade but we can also explicitly delete)
    await connection.query(
      'DELETE FROM bank_account_log_attachments WHERE log_id = ?',
      [logId]
    );
    
    // Delete the log
    await connection.query('DELETE FROM bank_account_logs WHERE id = ?', [logId]);
    
    await connection.commit();
    
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting bank account log:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  updateAccountBalance,
  getBankAccountLogs,
  createBankAccountLog,
  updateBankAccountLog,
  deleteBankAccountLog
};
