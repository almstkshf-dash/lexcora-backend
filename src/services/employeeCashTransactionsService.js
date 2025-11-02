const employeeCashTransactionsModel = require('../models/employeeCashTransactionsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');
const { sendNotification } = require('../utils/notificationHelper');
const db = require('../config/db');

// Helper function to get all admin user IDs
const getAdminIds = async () => {
  try {
    const [rows] = await db.query(`
      SELECT e.id 
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE r.role_en = 'admin'
    `);
    return rows.map(row => row.id);
  } catch (error) {
    console.error('Error fetching admin IDs:', error);
    return [];
  }
};

// Helper function to send notifications for transaction actions
const sendTransactionNotifications = async (employeeId, action, amount, type, createdBy) => {
  try {
    const actionTexts = {
      create: {
        title: 'عهدة جديدة',
        message: type === 'credit' 
          ? `تم إضافة عهدة لك بمبلغ ${amount} `
          : `تم خصم عهدة منك بمبلغ ${amount} `,
        adminMessage: type === 'credit'
          ? `تم إضافة عهدة بمبلغ ${amount} `
          : `تم خصم عهدة بمبلغ ${amount} `
      },
      update: {
        title: 'تحديث عهدة',
        message: `تم تحديث عهدتك - المبلغ: ${amount} `,
        adminMessage: `تم تحديث عهدة موظف - المبلغ: ${amount} `
      },
      delete: {
        title: 'حذف عهدة',
        message: `تم حذف عهدة بمبلغ ${amount} `,
        adminMessage: `تم حذف عهدة موظف بمبلغ ${amount} `
      }
    };

    const texts = actionTexts[action];
    if (!texts) return;

    // Send notification to the employee
    await sendNotification({
      recipientId: employeeId,
      title: texts.title,
      message: texts.message,
      type: action === 'delete' ? 'warning' : 'info',
      relatedType: 'employee',
      createdBy: createdBy
    });

    // Send notifications to all admin users
    const adminIds = await getAdminIds();
    const adminNotifications = adminIds.map(adminId => 
      sendNotification({
        recipientId: adminId,
        title: texts.title,
        message: texts.adminMessage,
        type: action === 'delete' ? 'warning' : 'info',
        relatedType: 'employee',
        createdBy: createdBy
      })
    );

    await Promise.all(adminNotifications);
  } catch (error) {
    console.error('Error sending transaction notifications:', error);
    // Don't throw - transaction should succeed even if notifications fail
  }
};

const getAllTransactions = async (filters) => {
  return await employeeCashTransactionsModel.getAllTransactions(filters);
};

const getTransactionById = async (id) => {
  return await employeeCashTransactionsModel.getTransactionById(id);
};

const createTransaction = async (transactionData) => {
  const result = await employeeCashTransactionsModel.createTransaction(transactionData);
  
  // Log transaction creation
  if (transactionData.created_by && result.success) {
    await logAdd(
      transactionData.created_by,
      'عهدة موظف',
      `${transactionData.type === 'credit' ? 'إضافة' : 'خصم'} عهدة بمبلغ ${transactionData.amount}`,
      result.data?.id
    );
  }
  
  // Send notifications to employee and admins
  if (result.success && transactionData.employee_id) {
    await sendTransactionNotifications(
      transactionData.employee_id,
      'create',
      transactionData.amount,
      transactionData.type,
      transactionData.created_by
    );
  }
  
  return result;
};

const updateTransaction = async (id, transactionData) => {
  const result = await employeeCashTransactionsModel.updateTransaction(id, transactionData);
  
  // Log transaction update
  if (transactionData.updated_by && result.success) {
    await logUpdate(
      transactionData.updated_by,
      'عهدة موظف',
      `تعديل عهدة بمبلغ ${transactionData.amount}`,
      id
    );
  }
  
  // Send notifications to employee and admins
  if (result.success && transactionData.employee_id) {
    await sendTransactionNotifications(
      transactionData.employee_id,
      'update',
      transactionData.amount,
      transactionData.type,
      transactionData.updated_by
    );
  }
  
  return result;
};

const deleteTransaction = async (id, deletedBy = null) => {
  // Get transaction details before deletion
  let transaction = null;
  if (deletedBy) {
    try {
      const transactionResult = await employeeCashTransactionsModel.getTransactionById(id);
      if (transactionResult.success) {
        transaction = transactionResult.data;
      }
    } catch (error) {
      console.error('Error getting transaction:', error);
    }
  }
  
  const result = await employeeCashTransactionsModel.deleteTransaction(id);
  
  // Log transaction deletion
  if (deletedBy && result.success && transaction) {
    await logDelete(
      deletedBy,
      'عهدة موظف',
      `حذف عهدة بمبلغ ${transaction.amount}`,
      id
    );
  }
  
  // Send notifications to employee and admins
  if (result.success && transaction && transaction.employee_id) {
    await sendTransactionNotifications(
      transaction.employee_id,
      'delete',
      transaction.amount,
      transaction.type,
      deletedBy
    );
  }
  
  return result;
};

const deleteAttachment = async (transactionId, attachmentId) => {
  return await employeeCashTransactionsModel.deleteAttachment(transactionId, attachmentId);
};

const updateTransactionStatus = async (id, { status, updated_by }) => {
  return await employeeCashTransactionsModel.updateTransactionStatus(id, { status, updated_by });
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
  deleteAttachment
};
