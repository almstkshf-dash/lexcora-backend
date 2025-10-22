const db = require("../config/db");

const getAllWallets = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        w.id,
        w.client_id,
        w.balance,
        w.currency,
        w.status,
        w.created_at,
        w.updated_at,
        w.created_by,
        w.updated_by,
        c.name as client_name,
        e1.name as created_by_name,
        e2.name as updated_by_name
      FROM wallets w
      LEFT JOIN parties c ON w.client_id = c.id
      LEFT JOIN employees e1 ON w.created_by = e1.id
      LEFT JOIN employees e2 ON w.updated_by = e2.id
      ORDER BY w.created_at DESC
    `);
    return { success: true, data: rows };
  } catch (error) {
    console.error('walletsModel: Database query failed:', error);
    // Fallback to simple query if JOIN fails
    try {
      const [rows] = await db.query("SELECT * FROM wallets ORDER BY created_at DESC");
      return { success: true, data: rows };
    } catch (fallbackError) {
      console.error('walletsModel: Fallback query also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

const getWalletById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      w.id,
      w.client_id,
      w.balance,
      w.currency,
      w.status,
      w.created_at,
      w.updated_at,
      w.created_by,
      w.updated_by,
      c.name as client_name,
      e1.name as created_by_name,
      e2.name as updated_by_name
    FROM wallets w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN employees e1 ON w.created_by = e1.id
    LEFT JOIN employees e2 ON w.updated_by = e2.id
    WHERE w.id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return { success: false, message: 'Wallet not found' };
  }
  
  return { success: true, data: rows[0] };
};

const getWalletsByClientId = async (clientId) => {
  const [rows] = await db.query(`
    SELECT 
      w.id,
      w.client_id,
      w.balance,
      w.currency,
      w.status,
      w.created_at,
      w.updated_at,
      w.created_by,
      w.updated_by,
      c.name as client_name,
      e1.name as created_by_name,
      e2.name as updated_by_name
    FROM wallets w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN employees e1 ON w.created_by = e1.id
    LEFT JOIN employees e2 ON w.updated_by = e2.id
    WHERE w.client_id = ?
    ORDER BY w.created_at DESC
  `, [clientId]);
  
  return { success: true, data: rows };
};

const createWallet = async (wallet) => {
  const { 
    client_id, 
    currency = 'AED', 
    status = 'active',
    created_by 
  } = wallet;
  
  try {
    const [result] = await db.query(`
      INSERT INTO wallets 
      (client_id, currency, status, created_by, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `, [client_id, currency, status, created_by]);
    
    return { success: true, insertId: result.insertId };
  } catch (error) {
    console.error("Error inserting wallet:", error);
    return { success: false, message: error.message };
  }
};

const updateWallet = async (id, wallet) => {
  const { 
    client_id, 
    currency, 
    status,
    updated_by 
  } = wallet;
  
  try {
    const [result] = await db.query(`
      UPDATE wallets 
      SET client_id = ?, 
          currency = ?, 
          status = ?,
          updated_by = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [client_id, currency, status, updated_by, id]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Wallet not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating wallet:", error);
    return { success: false, message: error.message };
  }
};

const deleteWallet = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM wallets WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Wallet not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting wallet:", error);
    return { success: false, message: error.message };
  }
};

const updateWalletBalance = async (id, amount, operation = 'add', updated_by = null) => {
  try {
    // SECURITY: Whitelist allowed operations to prevent SQL injection
    if (operation !== 'add' && operation !== 'subtract') {
      throw new Error('Invalid operation. Must be "add" or "subtract"');
    }
    
    const operator = operation === 'add' ? '+' : '-';
    const [result] = await db.query(`
      UPDATE wallets 
      SET balance = balance ${operator} ?,
          updated_by = ?,
          updated_at = NOW()
      WHERE id = ?
    `, [amount, updated_by, id]);
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Wallet not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating wallet balance:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  getAllWallets,
  getWalletById,
  getWalletsByClientId,
  createWallet,
  updateWallet,
  deleteWallet,
  updateWalletBalance
};