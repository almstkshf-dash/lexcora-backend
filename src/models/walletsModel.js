const db = require("../config/db");

const getWalletStats = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        COUNT(*) as total_wallets,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_wallets,
        COUNT(DISTINCT client_id) as unique_clients,
        SUM(balance) as total_balance,
        SUM(CASE WHEN currency = 'AED' THEN balance ELSE 0 END) as total_balance_aed,
        SUM(CASE WHEN currency = 'USD' THEN balance ELSE 0 END) as total_balance_usd
      FROM wallets
    `);
    
    return { success: true, data: rows[0] };
  } catch (error) {
    console.error('Error getting wallet stats:', error);
    return { success: false, message: error.message };
  }
};

const getAllWallets = async (options = {}) => {
  // options: { page, limit, search, status, currency, clientId, minBalance, maxBalance, sortBy, sortOrder }
  const {
    page = 1,
    limit = 25,
    search,
    status,
    currency,
    clientId,
    minBalance,
    maxBalance,
    sortBy = 'w.created_at',
    sortOrder = 'DESC'
  } = options;

  try {
    const whereClauses = [];
    const params = [];

    if (search) {
      whereClauses.push('(c.name LIKE ? OR c.phone LIKE ? OR w.id LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    if (status) {
      whereClauses.push('w.status = ?');
      params.push(status);
    }

    if (currency) {
      whereClauses.push('w.currency = ?');
      params.push(currency);
    }

    if (clientId) {
      whereClauses.push('w.client_id = ?');
      params.push(clientId);
    }

    if (minBalance !== undefined) {
      whereClauses.push('w.balance >= ?');
      params.push(minBalance);
    }

    if (maxBalance !== undefined) {
      whereClauses.push('w.balance <= ?');
      params.push(maxBalance);
    }

    const whereSQL = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM wallets w LEFT JOIN parties c ON w.client_id = c.id LEFT JOIN employees e1 ON w.created_by = e1.id ${whereSQL}`;
    const [countRows] = await db.query(countQuery, params);
    const total = countRows[0]?.total || 0;

    // Pagination
    const offset = (page - 1) * limit;

    // Whitelist sort columns to prevent injection
    const allowedSorts = {
      'created_at': 'w.created_at',
      'balance': 'w.balance',
      'id': 'w.id'
    };
    const sortColumn = allowedSorts[sortBy] || sortBy || 'w.created_at';
    const sortDirection = /desc/i.test(sortOrder) ? 'DESC' : 'ASC';

    const dataQuery = `
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
      ${whereSQL}
      ORDER BY ${db.escapeId ? db.escapeId(sortColumn) : sortColumn} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    // Append pagination params
    const dataParams = params.concat([Number(limit), Number(offset)]);
    const [rows] = await db.query(dataQuery, dataParams);

    return { 
      success: true, 
      data: rows, 
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('walletsModel: Database query failed:', error);
    // Fallback to original simple query (no filters)
    try {
      const [rows] = await db.query("SELECT * FROM wallets ORDER BY created_at DESC");
      return { 
        success: true, 
        data: rows, 
        pagination: {
          total: rows.length,
          page: 1,
          limit: rows.length,
          totalPages: 1
        }
      };
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
    LEFT JOIN parties c ON w.client_id = c.id
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
    LEFT JOIN parties c ON w.client_id = c.id
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
    // Check if party already has a wallet
    const [existingWallet] = await db.query(`
      SELECT id FROM wallets WHERE client_id = ? LIMIT 1
    `, [client_id]);
    
    if (existingWallet.length > 0) {
      return { 
        success: false, 
        message: 'This party already has a wallet',
        error: 'PARTY_ALREADY_HAS_WALLET'
      };
    }
    
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

const getAccountStatement = async (walletId, fromDate, toDate) => {
  try {
    let dateFilter = '';
    const params = [walletId];
    
    if (fromDate && toDate) {
      dateFilter = 'AND DATE(wd.created_at) BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    } else if (fromDate) {
      dateFilter = 'AND DATE(wd.created_at) >= ?';
      params.push(fromDate);
    } else if (toDate) {
      dateFilter = 'AND DATE(wd.created_at) <= ?';
      params.push(toDate);
    }
    
    // Get deposits
    const depositsQuery = `
      SELECT 
        wd.id,
        wd.wallet_id,
        wd.client_id,
        wd.case_id,
        wd.amount,
        wd.method,
        wd.bank_account_id,
        wd.created_at as transaction_date,
        wd.created_by,
        'deposit' as type,
        NULL as description,
        c.case_number,
        c.file_number,
        ba.account_name,
        ba.bank_name,
        ba.account_number,
        e.name as created_by_name
      FROM wallet_deposits wd
      LEFT JOIN cases c ON wd.case_id = c.id
      LEFT JOIN bank_accounts ba ON wd.bank_account_id = ba.id
      LEFT JOIN employees e ON wd.created_by = e.id
      WHERE wd.wallet_id = ? ${dateFilter}
    `;
    
    const expensesQuery = `
      SELECT 
        we.id,
        we.wallet_id,
        we.client_id,
        we.case_id,
        we.amount,
        'cash' as method,
        we.bank_account_id,
        we.invoice_date as transaction_date,
        we.created_by,
        'expense' as type,
        GROUP_CONCAT(wei.description SEPARATOR ', ') as description,
        c.case_number,
        c.file_number,
        ba.account_name,
        ba.bank_name,
        ba.account_number,
        e.name as created_by_name
      FROM wallet_expenses we
      LEFT JOIN wallet_expenses_items wei ON we.id = wei.wallet_expense_id
      LEFT JOIN cases c ON we.case_id = c.id
      LEFT JOIN bank_accounts ba ON we.bank_account_id = ba.id
      LEFT JOIN employees e ON we.created_by = e.id
      WHERE we.wallet_id = ? ${dateFilter.replace(/wd\./g, 'we.')}
      GROUP BY we.id
    `;
    
    // Execute both queries
    const [depositsRows] = await db.query(depositsQuery, params);
    const [expensesRows] = await db.query(expensesQuery, params);
    
    // Combine and sort by date
    const transactions = [...depositsRows, ...expensesRows].sort((a, b) => {
      return new Date(b.transaction_date) - new Date(a.transaction_date);
    });
    
    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error getting account statement:', error);
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
  updateWalletBalance,
  getWalletStats,
  getAccountStatement
};