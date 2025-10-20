const db = require("../config/db");

const getAllDeposits = async () => {
  const [rows] = await db.query(`
    SELECT 
      d.id,
      d.bank_account_id,
      d.amount,
      d.deposit_date,
      d.created_by,
      d.created_at,
      ba.bank_name,
      ba.account_name,
      ba.account_number,
      e.name as created_by_name
    FROM deposits d
    LEFT JOIN bank_accounts ba ON d.bank_account_id = ba.id
    LEFT JOIN employees e ON d.created_by = e.id
    ORDER BY d.deposit_date DESC, d.created_at DESC
  `);
  return { success: true, data: rows };
};

const getDepositById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      d.id,
      d.bank_account_id,
      d.amount,
      d.deposit_date,
      d.created_by,
      d.created_at,
      ba.bank_name,
      ba.account_name,
      ba.account_number,
      e.name as created_by_name
    FROM deposits d
    LEFT JOIN bank_accounts ba ON d.bank_account_id = ba.id
    LEFT JOIN employees e ON d.created_by = e.id
    WHERE d.id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return { success: false, message: 'Deposit not found' };
  }
  
  return { success: true, data: rows[0] };
};

const createDeposit = async (deposit) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { 
      bank_account_id, 
      amount, 
      deposit_date,
      created_by 
    } = deposit;
    
    // Insert deposit
    const [result] = await connection.query(`
      INSERT INTO deposits 
      (bank_account_id, amount, deposit_date, created_by, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `, [bank_account_id, amount, deposit_date, created_by]);
    
    // Update bank account balance
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance + ?
      WHERE id = ?
    `, [amount, bank_account_id]);
    
    await connection.commit();
    return { success: true, insertId: result.insertId };
  } catch (error) {
    await connection.rollback();
    console.error("Error inserting deposit:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const updateDeposit = async (id, deposit) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get old deposit data
    const [oldDeposit] = await connection.query(`
      SELECT bank_account_id, amount FROM deposits WHERE id = ?
    `, [id]);
    
    if (oldDeposit.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Deposit not found' };
    }
    
    const { 
      bank_account_id, 
      amount, 
      deposit_date
    } = deposit;
    
    // Update deposit
    const [result] = await connection.query(`
      UPDATE deposits 
      SET bank_account_id = ?, 
          amount = ?, 
          deposit_date = ?
      WHERE id = ?
    `, [bank_account_id, amount, deposit_date, id]);
    
    // Reverse old balance change
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance - ?
      WHERE id = ?
    `, [oldDeposit[0].amount, oldDeposit[0].bank_account_id]);
    
    // Apply new balance change
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance + ?
      WHERE id = ?
    `, [amount, bank_account_id]);
    
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error updating deposit:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const deleteDeposit = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get deposit data to reverse balance
    const [deposit] = await connection.query(`
      SELECT bank_account_id, amount FROM deposits WHERE id = ?
    `, [id]);
    
    if (deposit.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Deposit not found' };
    }
    
    // Delete deposit
    await connection.query("DELETE FROM deposits WHERE id = ?", [id]);
    
    // Reverse balance change
    await connection.query(`
      UPDATE bank_accounts 
      SET current_balance = current_balance - ?
      WHERE id = ?
    `, [deposit[0].amount, deposit[0].bank_account_id]);
    
    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting deposit:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllDeposits,
  getDepositById,
  createDeposit,
  updateDeposit,
  deleteDeposit
};
