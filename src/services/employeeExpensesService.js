const employeeExpensesModel = require('../models/employeeExpensesModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllExpenses = async (filters) => {
  return await employeeExpensesModel.getAllExpenses(filters);
};

const getExpenseById = async (id) => {
  return await employeeExpensesModel.getExpenseById(id);
};

const createExpense = async (expenseData) => {
  const result = await employeeExpensesModel.createExpense(expenseData);
  
  // Log expense creation
  if (expenseData.created_by && result.success) {
    await logAdd(
      expenseData.created_by,
      'مصروفات موظف',
      `إضافة مصروف بمبلغ ${expenseData.amount}`,
      result.data?.id
    );
  }
  
  return result;
};

const updateExpense = async (id, expenseData) => {
  const result = await employeeExpensesModel.updateExpense(id, expenseData);
  
  // Log expense update
  if (expenseData.updated_by && result.success) {
    await logUpdate(
      expenseData.updated_by,
      'مصروفات موظف',
      `تعديل مصروف بمبلغ ${expenseData.amount}`,
      id
    );
  }
  
  return result;
};

const deleteExpense = async (id, deletedBy = null) => {
  // Get expense details before deletion
  let expense = null;
  if (deletedBy) {
    try {
      const expenseResult = await employeeExpensesModel.getExpenseById(id);
      if (expenseResult.success) {
        expense = expenseResult.data;
      }
    } catch (error) {
      console.error('Error getting expense:', error);
    }
  }
  
  const result = await employeeExpensesModel.deleteExpense(id);
  
  // Log expense deletion
  if (deletedBy && result.success && expense) {
    await logDelete(
      deletedBy,
      'مصروفات موظف',
      `حذف مصروف بمبلغ ${expense.amount}`,
      id
    );
  }
  
  return result;
};

const addAttachments = async (expenseId, attachments) => {
  return await employeeExpensesModel.addAttachments(expenseId, attachments);
};

const deleteAttachment = async (expenseId, attachmentId) => {
  return await employeeExpensesModel.deleteAttachment(expenseId, attachmentId);
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
