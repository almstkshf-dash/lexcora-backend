const db = require("../config/db");
const { generatePresignedUrl } = require("../services/awsS3Service");

const getAllExpenses = async (filters = {}) => {
  const { page = 1, limit = 10, search = '' } = filters;
  const offset = (page - 1) * limit;
  
  // Build WHERE clause
  let whereConditions = ['ect.type = ?'];
  let queryParams = ['debit'];
  
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
  
  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
  
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
      ect.description,
      ect.status,
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

const getExpenseById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      ect.id,
      ect.employee_id,
      ect.amount,
      ect.description,
      ect.status,
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
    WHERE ect.id = ? AND ect.type = 'debit'
  `, [id]);
  
  if (rows.length === 0) {
    return { success: false, message: 'Expense not found' };
  }
  
  const expense = rows[0];
  if (expense.attachments) {
    try {
      expense.attachments = typeof expense.attachments === 'string' 
        ? JSON.parse(expense.attachments) 
        : expense.attachments;
    } catch (e) {
      console.error('Error parsing attachments:', e);
      expense.attachments = [];
    }
  } else {
    expense.attachments = [];
  }
  
  // Generate presigned URLs for attachments
  if (expense.attachments && expense.attachments.length > 0) {
    try {
      expense.attachments = await Promise.all(
        expense.attachments.map(async (attachment) => {
          if (attachment.attachment_url) {
            try {
              const presignedUrl = await generatePresignedUrl(attachment.attachment_url);
              return {
                ...attachment,
                attachment_url: presignedUrl
              };
            } catch (error) {
              console.error('Error generating presigned URL for attachment:', error);
              return attachment;
            }
          }
          return attachment;
        })
      );
    } catch (error) {
      console.error('Error processing attachments:', error);
    }
  }
  
  return { success: true, data: expense };
};

const createExpense = async (expenseData) => {
  const { 
    employee_id, 
    amount, 
    description,
    bank_account_id,
    attachments = [],
    created_by 
  } = expenseData;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Check employee's current balance
    const [employees] = await connection.query(`
      SELECT id, name, COALESCE(balance, 0) as balance 
      FROM employees 
      WHERE id = ?
    `, [employee_id]);
    
    if (employees.length === 0) {
      await connection.rollback();
      return { success: false, message: 'الموظف غير موجود' };
    }
    
    const employee = employees[0];
    const currentBalance = parseFloat(employee.balance);
    const expenseAmount = parseFloat(amount);
    
    // Check if employee has sufficient balance
    if (currentBalance < expenseAmount) {
      await connection.rollback();
      return { 
        success: false, 
        message: `رصيد الموظف غير كافٍ. الرصيد الحالي: ${currentBalance.toFixed(2)} د.إ، المبلغ المطلوب: ${expenseAmount.toFixed(2)} د.إ` 
      };
    }
    
    // Insert as debit transaction (expense)
    const [result] = await connection.query(`
      INSERT INTO employee_cash_transactions 
      (employee_id, amount, type, description, created_by, created_at) 
      VALUES (?, ?, 'debit', ?, ?, NOW())
    `, [employee_id, amount, description, created_by]);
    
    const expenseId = result.insertId;
    
    // Decrease employee balance (debit reduces balance)
    await connection.query(`
      UPDATE employees 
      SET balance = COALESCE(balance, 0) - ? 
      WHERE id = ?
    `, [amount, employee_id]);
    
    // If bank account is provided, subtract from bank account
    if (bank_account_id) {
      await connection.query(`
        UPDATE bank_accounts 
        SET current_balance = current_balance - ? 
        WHERE id = ?
      `, [amount, bank_account_id]);
    }
    
    // Insert attachments if any
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map(att => [
        expenseId,
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
    
    return { success: true, data: { id: expenseId } };
  } catch (error) {
    await connection.rollback();
    console.error("Error inserting expense:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const updateExpense = async (id, expenseData) => {
  const { 
    employee_id, 
    amount, 
    description,
    attachments = []
  } = expenseData;
  
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get old expense data first
    const [oldExpenses] = await connection.query(`
      SELECT employee_id, amount 
      FROM employee_cash_transactions 
      WHERE id = ? AND type = 'debit'
    `, [id]);
    
    if (oldExpenses.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Expense not found' };
    }
    
    const oldExpense = oldExpenses[0];
    
    // Reverse the old expense's effect on employee balance (add back)
    await connection.query(`
      UPDATE employees 
      SET balance = COALESCE(balance, 0) + ? 
      WHERE id = ?
    `, [oldExpense.amount, oldExpense.employee_id]);
    
    // Update expense
    const [result] = await connection.query(`
      UPDATE employee_cash_transactions 
      SET employee_id = ?, 
          amount = ?, 
          description = ?
      WHERE id = ?
    `, [employee_id, amount, description, id]);
    
    // Apply the new expense's effect on employee balance (subtract)
    await connection.query(`
      UPDATE employees 
      SET balance = COALESCE(balance, 0) - ? 
      WHERE id = ?
    `, [amount, employee_id]);
    
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
    console.error("Error updating expense:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const deleteExpense = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Get expense data before deleting
    const [expenses] = await connection.query(`
      SELECT employee_id, amount 
      FROM employee_cash_transactions 
      WHERE id = ? AND type = 'debit'
    `, [id]);
    
    if (expenses.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Expense not found' };
    }
    
    const expense = expenses[0];
    
    // Reverse the expense's effect on employee balance (add back)
    await connection.query(`
      UPDATE employees 
      SET balance = COALESCE(balance, 0) + ? 
      WHERE id = ?
    `, [expense.amount, expense.employee_id]);
    
    // Attachments will be deleted automatically due to ON DELETE CASCADE
    // Delete expense
    const [result] = await connection.query(
      "DELETE FROM employee_cash_transactions WHERE id = ? AND type = 'debit'", 
      [id]
    );
    
    await connection.commit();
    
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting expense:", error);
    return { success: false, message: error.message };
  } finally {
    connection.release();
  }
};

const addAttachments = async (expenseId, attachments) => {
  try {
    if (!attachments || attachments.length === 0) {
      return { success: false, message: 'No attachments provided' };
    }

    const attachmentValues = attachments.map(att => [
      expenseId,
      att.attachment_url,
      att.attachment_name
    ]);
    
    await db.query(`
      INSERT INTO cash_transaction_attachments 
      (transaction_id, attachment_url, attachment_name) 
      VALUES ?
    `, [attachmentValues]);
    
    return { success: true, message: 'Attachments added successfully' };
  } catch (error) {
    console.error("Error adding attachments:", error);
    return { success: false, message: error.message };
  }
};

const deleteAttachment = async (expenseId, attachmentId) => {
  try {
    const [result] = await db.query(
      "DELETE FROM cash_transaction_attachments WHERE id = ? AND transaction_id = ?", 
      [attachmentId, expenseId]
    );
    
    if (result.affectedRows === 0) {
      return { success: false, message: 'Attachment not found' };
    }
    
    return { success: true, message: 'Attachment deleted successfully' };
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  addAttachments,
  deleteAttachment
};
