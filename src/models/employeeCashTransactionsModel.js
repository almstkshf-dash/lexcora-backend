const db = require("../config/db");
const accountingService = require("../services/accountingService");

const getAllTransactions = async (filters = {}) => {
  const { page = 1, limit = 10, search = '', type = '', employee_id = '', client_id = '', date_from = '', date_to = '' } = filters;
  const offset = (page - 1) * limit;
  
  // Build WHERE clause
  let whereConditions = [];
  let queryParams = [];
  
  if (search) {
    whereConditions.push(`(
      e.name LIKE ? OR 
      e.phone LIKE ? OR 
      ect.description LIKE ? OR 
      ect.amount LIKE ?
    )`);
    const searchPattern = `%${search}%`;
    queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }
  
  if (type) {
    whereConditions.push('ect.type = ?');
    queryParams.push(type);
  }
  
  if (employee_id) {
    whereConditions.push('ect.employee_id = ?');
    queryParams.push(employee_id);
  }
  
  if (client_id) {
    whereConditions.push('ect.client_id = ?');
    queryParams.push(client_id);
  }
  
  if (date_from) {
    whereConditions.push('DATE(ect.created_at) >= ?');
    queryParams.push(date_from);
  }
  
  if (date_to) {
    whereConditions.push('DATE(ect.created_at) <= ?');
    queryParams.push(date_to);
  }
  
  const whereClause = whereConditions.length > 0 
    ? `WHERE ${whereConditions.join(' AND ')}`
    : '';
  
  // Get total count
  const [countResult] = await db.query(`
    SELECT COUNT(*) as total
    FROM employee_cash_transactions ect
    LEFT JOIN employees e ON ect.employee_id = e.id
    ${whereClause}
  `, queryParams);
  
  const total = countResult[0].total;
  const totalPages = Math.ceil(total / limit);
  
  // Get paginated data
  const [rows] = await db.query(`
    SELECT 
      ect.id,
      ect.employee_id,
      ect.client_id,
      ect.bank_account_id,
      ect.amount,
      ect.type,
      ect.description,
      ect.status,
      ect.case_id,
      ect.department_id,
      ect.project_id,
      ect.created_by,
      ect.created_at,
      e.name as employee_name,
      e.phone as employee_phone,
      e.email as employee_email,
      COALESCE(e.balance, 0) as employee_balance,
      creator.name as created_by_name,
      p.name as client_name,
      p.phone as client_phone,
      ba.bank_name,
      ba.account_name,
      ba.account_number,
      c.topic as case_name,
      d.name_ar as department_name,
      proj.name as project_name
    FROM employee_cash_transactions ect
    LEFT JOIN employees e ON ect.employee_id = e.id
    LEFT JOIN employees creator ON ect.created_by = creator.id
    LEFT JOIN parties p ON ect.client_id = p.id
    LEFT JOIN bank_accounts ba ON ect.bank_account_id = ba.id
    LEFT JOIN cases c ON ect.case_id = c.id
    LEFT JOIN departments d ON ect.department_id = d.id
    LEFT JOIN projects proj ON ect.project_id = proj.id
    ${whereClause}
    ORDER BY ect.created_at DESC
    LIMIT ? OFFSET ?
  `, [...queryParams, limit, offset]);
  
  return { 
    success: true, 
    data: rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasMore: page < totalPages
    }
  };
};

const getTransactionById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      ect.id,
      ect.employee_id,
      ect.client_id,
      ect.bank_account_id,
      ect.amount,
      ect.type,
      ect.description,
      ect.status,
      ect.case_id,
      ect.department_id,
      ect.project_id,
      ect.created_by,
      ect.created_at,
      e.name as employee_name,
      e.phone as employee_phone,
      e.email as employee_email,
      COALESCE(e.balance, 0) as employee_balance,
      creator.name as created_by_name,
      p.name as client_name,
      p.phone as client_phone,
      ba.bank_name,
      ba.account_name,
      ba.account_number,
      c.topic as case_name,
      d.name_ar as department_name,
      proj.name as project_name,
      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', cta.id,
            'attachment_url', cta.attachment_url,
            'attachment_name', cta.attachment_name,
            'created_at', cta.created_at
          )
        )
        FROM cash_transaction_attachments cta
        WHERE cta.transaction_id = ect.id
      ) as attachments
    FROM employee_cash_transactions ect
    LEFT JOIN employees e ON ect.employee_id = e.id
    LEFT JOIN employees creator ON ect.created_by = creator.id
    LEFT JOIN parties p ON ect.client_id = p.id
    LEFT JOIN bank_accounts ba ON ect.bank_account_id = ba.id
    LEFT JOIN cases c ON ect.case_id = c.id
    LEFT JOIN departments d ON ect.department_id = d.id
    LEFT JOIN projects proj ON ect.project_id = proj.id
    WHERE ect.id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return { success: false, message: 'Transaction not found' };
  }
  
  // Parse attachments to ensure it's always an array
  const transaction = rows[0];
  if (transaction.attachments) {
    try {
      transaction.attachments = typeof transaction.attachments === 'string' 
        ? JSON.parse(transaction.attachments) 
        : transaction.attachments;
    } catch (e) {
      console.error('Error parsing attachments:', e);
      transaction.attachments = [];
    }
  } else {
    transaction.attachments = [];
  }
  
  return { success: true, data: transaction };
};

const createTransaction = async (transactionData) => {
  const { 
    employee_id, 
    amount, 
    type, 
    description,
    client_id = null,
    bank_account_id = null,
    case_id = null,
    department_id = null,
    project_id = null,
    attachments = [],
    created_by 
  } = transactionData;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert transaction
    const [result] = await connection.query(`
      INSERT INTO employee_cash_transactions 
      (employee_id, amount, type, description, client_id, bank_account_id, case_id, department_id, project_id, created_by, created_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [employee_id, amount, type, description, client_id, bank_account_id, case_id, department_id, project_id, created_by]);
    
    const transactionId = result.insertId;
    
    // Update employee balance based on transaction type
    if (type === 'credit') {
      // Credit increases employee balance
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) + ? 
        WHERE id = ?
      `, [amount, employee_id]);
    } else if (type === 'debit') {
      // Debit decreases employee balance
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) - ? 
        WHERE id = ?
      `, [amount, employee_id]);
    }
   
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map(att => [
        transactionId,
        att.attachment_url,
        att.attachment_name
      ]);
      
      
      await connection.query(`
        INSERT INTO cash_transaction_attachments 
        (transaction_id, attachment_url, attachment_name) 
        VALUES ?
      `, [attachmentValues]);
      
    } else {
      console.log('No attachments to insert');
    }
    
    // Automated Accounting Posting
    const accountingEvent = type === 'debit' ? 'EXPENSE_PAID' : 'PAYMENT_RECEIVED';
    await accountingService.postAutomatedEntry(accountingEvent, {
      amount: amount,
      description: description,
      reference: `ECT-${transactionId}`,
      party_id: client_id,
      employee_id: employee_id,
      bank_account_id: bank_account_id,
      created_by: created_by
    }, connection);

    await connection.commit();
    
    return { success: true, data: { id: transactionId } };
  } catch (error) {
    await connection.rollback();
    console.error("Error inserting transaction:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const updateTransaction = async (id, transactionData) => {
  const { 
    employee_id, 
    amount, 
    type, 
    description,
    client_id = null,
    bank_account_id = null,
    case_id = null,
    department_id = null,
    project_id = null,
    attachments = []
  } = transactionData;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get old transaction data first (including bank_account_id)
    const [oldTransactions] = await connection.query(`
      SELECT employee_id, amount, type, bank_account_id 
      FROM employee_cash_transactions 
      WHERE id = ?
    `, [id]);
    
    if (oldTransactions.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Transaction not found' };
    }
    
    const oldTransaction = oldTransactions[0];
    
    // Reverse the old transaction's effect on employee balance
    if (oldTransaction.type === 'credit') {
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) - ? 
        WHERE id = ?
      `, [oldTransaction.amount, oldTransaction.employee_id]);
    } else if (oldTransaction.type === 'debit') {
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) + ? 
        WHERE id = ?
      `, [oldTransaction.amount, oldTransaction.employee_id]);
    }
    
    // Update transaction record
    const [result] = await connection.query(`
      UPDATE employee_cash_transactions 
      SET employee_id = ?, 
          amount = ?, 
          type = ?, 
          description = ?,
          client_id = ?,
          bank_account_id = ?,
          case_id = ?,
          department_id = ?,
          project_id = ?
      WHERE id = ?
    `, [employee_id, amount, type, description, client_id, bank_account_id, case_id, department_id, project_id, id]);
    
    // Apply the new transaction's effect on employee balance
    if (type === 'credit') {
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) + ? 
        WHERE id = ?
      `, [amount, employee_id]);
    } else if (type === 'debit') {
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) - ? 
        WHERE id = ?
      `, [amount, employee_id]);
    }
    
    // Delete old attachments
    await connection.query(`
      DELETE FROM cash_transaction_attachments 
      WHERE transaction_id = ?
    `, [id]);
    
    // Insert new attachments if any
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map(att => [
        id,
        att.attachment_url,
        att.attachment_name
      ]);
      
      await connection.query(`
        INSERT INTO cash_transaction_attachments 
        (transaction_id, attachment_url, attachment_name) 
        VALUES ?
      `, [attachmentValues]);
    }
    
    await connection.commit();
    
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error updating transaction:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const deleteTransaction = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get transaction data before deleting (including bank_account_id)
    const [transactions] = await connection.query(`
      SELECT employee_id, amount, type, bank_account_id 
      FROM employee_cash_transactions 
      WHERE id = ?
    `, [id]);
    
    if (transactions.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Transaction not found' };
    }
    
    const transaction = transactions[0];
    
    // Reverse the transaction's effect on employee balance
    if (transaction.type === 'credit') {
      // Remove credit (decrease balance)
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) - ? 
        WHERE id = ?
      `, [transaction.amount, transaction.employee_id]);
    } else if (transaction.type === 'debit') {
      // Remove debit (increase balance)
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) + ? 
        WHERE id = ?
      `, [transaction.amount, transaction.employee_id]);
    }
    
    // Attachments will be deleted automatically due to ON DELETE CASCADE
    const [result] = await connection.query(
      "DELETE FROM employee_cash_transactions WHERE id = ?", 
      [id]
    );
    
    await connection.commit();
    
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting transaction:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const deleteAttachment = async (transactionId, attachmentId) => {
  try {
    const [result] = await db.query(
      "DELETE FROM cash_transaction_attachments WHERE id = ? AND transaction_id = ?", 
      [attachmentId, transactionId]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Attachment not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return { success: false, message: error.message };
  }
};

const updateTransactionStatus = async (id, { status, updated_by }) => {
  try {
    const [result] = await db.query(
      `UPDATE employee_cash_transactions 
       SET status = ? 
       WHERE id = ?`,
      [status, id]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Transaction not found' };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating transaction status:", error);
    return { success: false, message: error.message };
  }
};

const getTransactionStatistics = async (filters) => {
  try {
    const { period, date_from, date_to, type, employee_id, group_by } = filters;
    
    // Calculate date range based on period
    let startDate, endDate;
    const today = new Date();
    
    if (period === 'custom' && date_from && date_to) {
      startDate = date_from;
      endDate = date_to;
    } else {
      endDate = today.toISOString().split('T')[0]; // Today
      
      switch (period) {
        case 'last_month':
          startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
          break;
        case 'last_3_months':
          startDate = new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0];
          break;
        case 'last_6_months':
          startDate = new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
          break;
        case 'last_year':
          startDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
      }
    }
    
    // Build WHERE clause
    let whereConditions = ['DATE(ect.created_at) BETWEEN ? AND ?'];
    let queryParams = [startDate, endDate];
    
    if (employee_id) {
      whereConditions.push('ect.employee_id = ?');
      queryParams.push(employee_id);
    }
    
    // Determine grouping format
    let dateFormat, dateGroup;
    switch (group_by) {
      case 'week':
        dateFormat = '%Y-%u'; // Year-Week
        dateGroup = 'YEARWEEK(ect.created_at, 1)';
        break;
      case 'month':
        dateFormat = '%Y-%m'; // Year-Month
        dateGroup = 'DATE_FORMAT(ect.created_at, "%Y-%m")';
        break;
      case 'day':
      default:
        dateFormat = '%Y-%m-%d'; // Year-Month-Day
        dateGroup = 'DATE(ect.created_at)';
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query for transaction statistics
    let chartData = [];
    
    if (type === 'both' || !type) {
      // Get both credit and debit in separate columns
      const [rows] = await db.query(`
        SELECT 
          ${dateGroup} as date,
          DATE_FORMAT(ect.created_at, '${dateFormat}') as formatted_date,
          SUM(CASE WHEN ect.type = 'credit' THEN ect.amount ELSE 0 END) as credit,
          SUM(CASE WHEN ect.type = 'debit' THEN ect.amount ELSE 0 END) as debit,
          COUNT(CASE WHEN ect.type = 'credit' THEN 1 END) as credit_count,
          COUNT(CASE WHEN ect.type = 'debit' THEN 1 END) as debit_count
        FROM employee_cash_transactions ect
        WHERE ${whereClause}
        GROUP BY ${dateGroup}
        ORDER BY date ASC
      `, queryParams);
      
      chartData = rows.map(row => ({
        date: row.formatted_date,
        credit: parseFloat(row.credit) || 0,
        debit: parseFloat(row.debit) || 0,
        credit_count: parseInt(row.credit_count) || 0,
        debit_count: parseInt(row.debit_count) || 0
      }));
    } else {
      // Get only specific type (credit or debit)
      whereConditions.push('ect.type = ?');
      queryParams.push(type);
      const whereClauseWithType = whereConditions.join(' AND ');
      
      const [rows] = await db.query(`
        SELECT 
          ${dateGroup} as date,
          DATE_FORMAT(ect.created_at, '${dateFormat}') as formatted_date,
          SUM(ect.amount) as amount,
          COUNT(*) as count
        FROM employee_cash_transactions ect
        WHERE ${whereClauseWithType}
        GROUP BY ${dateGroup}
        ORDER BY date ASC
      `, queryParams);
      
      chartData = rows.map(row => ({
        date: row.formatted_date,
        amount: parseFloat(row.amount) || 0,
        count: parseInt(row.count) || 0
      }));
    }
    
    // Get summary statistics
    const summaryParams = [startDate, endDate];
    if (employee_id) {
      summaryParams.push(employee_id);
    }
    
    const summaryWhereClause = employee_id 
      ? 'WHERE DATE(created_at) BETWEEN ? AND ? AND employee_id = ?'
      : 'WHERE DATE(created_at) BETWEEN ? AND ?';
    
    const [summary] = await db.query(`
      SELECT 
        SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as total_credit,
        SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as total_debit,
        COUNT(CASE WHEN type = 'credit' THEN 1 END) as total_credit_count,
        COUNT(CASE WHEN type = 'debit' THEN 1 END) as total_debit_count,
        COUNT(*) as total_transactions
      FROM employee_cash_transactions
      ${summaryWhereClause}
    `, summaryParams);
    
    return {
      success: true,
      data: {
        chart_data: chartData,
        summary: {
          total_credit: parseFloat(summary[0].total_credit) || 0,
          total_debit: parseFloat(summary[0].total_debit) || 0,
          total_credit_count: parseInt(summary[0].total_credit_count) || 0,
          total_debit_count: parseInt(summary[0].total_debit_count) || 0,
          total_transactions: parseInt(summary[0].total_transactions) || 0,
          net_amount: (parseFloat(summary[0].total_credit) || 0) - (parseFloat(summary[0].total_debit) || 0)
        },
        filters: {
          period,
          date_from: startDate,
          date_to: endDate,
          type,
          employee_id,
          group_by
        }
      }
    };
  } catch (error) {
    console.error("Error fetching transaction statistics:", error);
    return { success: false, message: error.message };
  }
};

const getExpensesByClientId = async (clientId) => {
  const query = `
    SELECT 
      ect.*,
      e.name as employee_name,
      creator.name as created_by_name,
      p.name as client_name
    FROM employee_cash_transactions ect
    LEFT JOIN employees e ON ect.employee_id = e.id
    LEFT JOIN employees creator ON ect.created_by = creator.id
    LEFT JOIN parties p ON ect.client_id = p.id
    WHERE ect.client_id = ? 
    AND ect.type = 'debit' 
    ORDER BY ect.created_at DESC
  `;
  
  const [rows] = await db.query(query, [clientId]);
  return rows;
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
  getExpensesByClientId,
  deleteAttachment,
  getTransactionStatistics
};
