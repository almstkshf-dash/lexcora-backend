const db = require("../config/db");

const getAllTransactions = async (filters = {}) => {
  const { page = 1, limit = 10, search = '', type = '' } = filters;
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
      ect.amount,
      ect.type,
      ect.description,
      ect.created_by,
      ect.created_at,
      e.name as employee_name,
      e.phone as employee_phone,
      e.email as employee_email,
      COALESCE(e.balance, 0) as employee_balance,
      creator.name as created_by_name
    FROM employee_cash_transactions ect
    LEFT JOIN employees e ON ect.employee_id = e.id
    LEFT JOIN employees creator ON ect.created_by = creator.id
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
      ect.amount,
      ect.type,
      ect.description,
      ect.created_by,
      ect.created_at,
      e.name as employee_name,
      e.phone as employee_phone,
      e.email as employee_email,
      COALESCE(e.balance, 0) as employee_balance,
      creator.name as created_by_name,
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
    bank_account_id,
    attachments = [],
    created_by 
  } = transactionData;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Insert transaction
    const [result] = await connection.query(`
      INSERT INTO employee_cash_transactions 
      (employee_id, amount, type, description, created_by, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [employee_id, amount, type, description, created_by]);
    
    const transactionId = result.insertId;
    
    // Update employee balance based on transaction type
    if (type === 'credit') {
      // Credit increases employee balance
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) + ? 
        WHERE id = ?
      `, [amount, employee_id]);
      
      // When giving custody to employee (credit), subtract from bank account
      if (bank_account_id) {
        await connection.query(`
          UPDATE bank_accounts 
          SET current_balance = current_balance - ? 
          WHERE id = ?
        `, [amount, bank_account_id]);
      }
    } else if (type === 'debit') {
      // Debit decreases employee balance
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) - ? 
        WHERE id = ?
      `, [amount, employee_id]);
      
      // When taking money from employee (debit), add to bank account
      if (bank_account_id) {
        await connection.query(`
          UPDATE bank_accounts 
          SET current_balance = current_balance + ? 
          WHERE id = ?
        `, [amount, bank_account_id]);
      }
    }
    
    // Insert attachments if any
    console.log('=== Inserting Attachments ===');
    console.log('Attachments to insert:', attachments);
    console.log('Attachments length:', attachments?.length);
    
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map(att => [
        transactionId,
        att.attachment_url,
        att.attachment_name
      ]);
      
      console.log('Attachment values for SQL:', attachmentValues);
      
      await connection.query(`
        INSERT INTO cash_transaction_attachments 
        (transaction_id, attachment_url, attachment_name) 
        VALUES ?
      `, [attachmentValues]);
      
      console.log('Attachments inserted successfully');
    } else {
      console.log('No attachments to insert');
    }
    
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
    bank_account_id,
    attachments = []
  } = transactionData;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get old transaction data first
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
      
      // Reverse bank account deduction
      if (oldTransaction.bank_account_id) {
        await connection.query(`
          UPDATE bank_accounts 
          SET current_balance = current_balance + ? 
          WHERE id = ?
        `, [oldTransaction.amount, oldTransaction.bank_account_id]);
      }
    } else if (oldTransaction.type === 'debit') {
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) + ? 
        WHERE id = ?
      `, [oldTransaction.amount, oldTransaction.employee_id]);
      
      // Reverse bank account addition
      if (oldTransaction.bank_account_id) {
        await connection.query(`
          UPDATE bank_accounts 
          SET current_balance = current_balance - ? 
          WHERE id = ?
        `, [oldTransaction.amount, oldTransaction.bank_account_id]);
      }
    }
    
    // Update transaction
    const [result] = await connection.query(`
      UPDATE employee_cash_transactions 
      SET employee_id = ?, 
          amount = ?, 
          type = ?, 
          bank_account_id = ?,
          description = ?
      WHERE id = ?
    `, [employee_id, amount, type, bank_account_id || null, description, id]);
    
    // Apply the new transaction's effect on employee balance
    if (type === 'credit') {
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) + ? 
        WHERE id = ?
      `, [amount, employee_id]);
      
      // Apply new bank account deduction
      if (bank_account_id) {
        await connection.query(`
          UPDATE bank_accounts 
          SET current_balance = current_balance - ? 
          WHERE id = ?
        `, [amount, bank_account_id]);
      }
    } else if (type === 'debit') {
      await connection.query(`
        UPDATE employees 
        SET balance = COALESCE(balance, 0) - ? 
        WHERE id = ?
      `, [amount, employee_id]);
      
      // Apply new bank account addition
      if (bank_account_id) {
        await connection.query(`
          UPDATE bank_accounts 
          SET current_balance = current_balance + ? 
          WHERE id = ?
        `, [amount, bank_account_id]);
      }
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
    
    // Get transaction data before deleting
    const [transactions] = await connection.query(`
      SELECT employee_id, amount, type 
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

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAttachment
};
