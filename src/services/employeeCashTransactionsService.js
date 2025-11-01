const employeeCashTransactionsModel = require('../models/employeeCashTransactionsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

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
  
  return result;
};

const deleteAttachment = async (transactionId, attachmentId) => {
  return await employeeCashTransactionsModel.deleteAttachment(transactionId, attachmentId);
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAttachment
};
