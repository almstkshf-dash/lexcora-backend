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

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  updateAccountBalance
};
