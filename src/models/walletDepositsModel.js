const db = require("../config/db");

const getAllWalletDeposits = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        wd.id,
        wd.wallet_id,
        wd.client_id,
        wd.case_id,
        wd.bank_account_id,
        wd.amount,
        wd.method,
        wd.cheque_number,
        wd.reference_no,
        wd.note,
        wd.created_at,
        wd.created_by,
        c.name as client_name,
        cs.case_number,
        cs.file_number,
        cs.topic as case_topic,
        cs.fees as case_fees,
        ba.account_number,
        ba.account_name,
        ba.bank_name,
        e.name as created_by_name
      FROM wallet_deposits wd
      LEFT JOIN parties c ON wd.client_id = c.id
      LEFT JOIN cases cs ON wd.case_id = cs.id
      LEFT JOIN bank_accounts ba ON wd.bank_account_id = ba.id
      LEFT JOIN employees e ON wd.created_by = e.id
      ORDER BY wd.created_at DESC
    `);
    return { success: true, data: rows };
  } catch (error) {
    console.error('walletDepositsModel: Database query failed:', error);
    // Fallback to simple query if JOIN fails
    try {
      const [rows] = await db.query("SELECT * FROM wallet_deposits ORDER BY created_at DESC");
      return { success: true, data: rows };
    } catch (fallbackError) {
      console.error('walletDepositsModel: Fallback query also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

const getWalletDepositById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      wd.id,
      wd.wallet_id,
      wd.client_id,
      wd.case_id,
      wd.bank_account_id,
      wd.amount,
      wd.method,
      wd.cheque_number,
      wd.reference_no,
      wd.note,
      wd.created_at,
      wd.created_by,
      c.name as client_name,
      cs.case_number,
      cs.file_number,
      cs.topic as case_topic,
      cs.fees as case_fees,
      ba.account_number,
      ba.account_name,
      ba.bank_name,
      e.name as created_by_name
    FROM wallet_deposits wd
    LEFT JOIN parties c ON wd.client_id = c.id
    LEFT JOIN cases cs ON wd.case_id = cs.id
    LEFT JOIN bank_accounts ba ON wd.bank_account_id = ba.id
    LEFT JOIN employees e ON wd.created_by = e.id
    WHERE wd.id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return { success: false, message: 'Wallet deposit not found' };
  }
  
  return { success: true, data: rows[0] };
};

const getDepositsByWalletId = async (walletId) => {
  const [rows] = await db.query(`
    SELECT 
      wd.id,
      wd.wallet_id,
      wd.client_id,
      wd.case_id,
      wd.bank_account_id,
      wd.amount,
      wd.method,
      wd.cheque_number,
      wd.reference_no,
      wd.note,
      wd.created_at,
      wd.created_by,
      c.name as client_name,
      cs.case_number,
      cs.file_number,
      cs.topic as case_topic,
      cs.fees as case_fees,
      ba.account_number,
      ba.account_name,
      ba.bank_name,
      e.name as created_by_name
    FROM wallet_deposits wd
    LEFT JOIN parties c ON wd.client_id = c.id
    LEFT JOIN cases cs ON wd.case_id = cs.id
    LEFT JOIN bank_accounts ba ON wd.bank_account_id = ba.id
    LEFT JOIN employees e ON wd.created_by = e.id
    WHERE wd.wallet_id = ?
    ORDER BY wd.created_at DESC
  `, [walletId]);
  
  return { success: true, data: rows };
};

const getDepositsByClientId = async (clientId) => {
  const [rows] = await db.query(`
    SELECT 
      wd.id,
      wd.wallet_id,
      wd.client_id,
      wd.case_id,
      wd.bank_account_id,
      wd.amount,
      wd.method,
      wd.cheque_number,
      wd.reference_no,
      wd.note,
      wd.created_at,
      wd.created_by,
      c.name as client_name,
      cs.case_number,
      cs.file_number,
      cs.topic as case_topic,
      cs.fees as case_fees,
      ba.account_number,
      ba.account_name,
      ba.bank_name,
      e.name as created_by_name
    FROM wallet_deposits wd
    LEFT JOIN parties c ON wd.client_id = c.id
    LEFT JOIN cases cs ON wd.case_id = cs.id
    LEFT JOIN bank_accounts ba ON wd.bank_account_id = ba.id
    LEFT JOIN employees e ON wd.created_by = e.id
    WHERE wd.client_id = ?
    ORDER BY wd.created_at DESC
  `, [clientId]);
  
  return { success: true, data: rows };
};

const createWalletDeposit = async (deposit) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      wallet_id, 
      client_id,
      case_id,
      bank_account_id,
      amount,
      method,
      cheque_number,
      reference_no,
      note,
      created_by 
    } = deposit;
    
    // Insert wallet deposit
    const [result] = await connection.query(`
      INSERT INTO wallet_deposits 
      (wallet_id, client_id, case_id, bank_account_id, amount, method, cheque_number, reference_no, note, created_by, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [wallet_id, client_id, case_id, bank_account_id, amount, method, cheque_number, reference_no, note, created_by]);
    
    // Update wallet balance
    await connection.query(`
      UPDATE wallets 
      SET balance = balance + ?,
          updated_by = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [amount, created_by, wallet_id]);
    
    // Bank account balance is no longer updated automatically
    // The bank account balance should be managed separately
    
    await connection.commit();
    
    return { success: true, insertId: result.insertId };
  } catch (error) {
    await connection.rollback();
    console.error("Error inserting wallet deposit:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const updateWalletDeposit = async (id, deposit) => {
  const { 
    case_id,
    bank_account_id,
    amount,
    method,
    cheque_number,
    reference_no,
    note
  } = deposit;
  
  try {
    const [result] = await db.query(`
      UPDATE wallet_deposits 
      SET case_id = ?,
          bank_account_id = ?, 
          amount = ?, 
          method = ?,
          cheque_number = ?,
          reference_no = ?,
          note = ?
      WHERE id = ?
    `, [case_id, bank_account_id, amount, method, cheque_number, reference_no, note, id]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Wallet deposit not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating wallet deposit:", error);
    return { success: false, message: error.message };
  }
};

const deleteWalletDeposit = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get deposit details before deletion
    const [depositRows] = await connection.query(
      "SELECT wallet_id, bank_account_id, amount FROM wallet_deposits WHERE id = ?", 
      [id]
    );
    
    if (depositRows.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Wallet deposit not found' };
    }
    
    const { wallet_id, bank_account_id, amount } = depositRows[0];
    
    // Delete the deposit
    await connection.query("DELETE FROM wallet_deposits WHERE id = ?", [id]);
    
    // Update wallet balance (subtract the deposit amount)
    await connection.query(`
      UPDATE wallets 
      SET balance = balance - ?,
          updated_at = NOW()
      WHERE id = ?
    `, [amount, wallet_id]);
    
    // Bank account balance is no longer updated automatically
    // The bank account balance should be managed separately
    
    await connection.commit();
    
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting wallet deposit:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllWalletDeposits,
  getWalletDepositById,
  getDepositsByWalletId,
  getDepositsByClientId,
  createWalletDeposit,
  updateWalletDeposit,
  deleteWalletDeposit
};
