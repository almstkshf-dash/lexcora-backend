const employeeCashTransactionsService = require('../services/employeeCashTransactionsService');

// Get all employee cash transactions
const getAllTransactions = async (req, res) => {
  try {
    const { page, limit, search, type, employee_id, date_from, date_to } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      type: type || '',
      employee_id: employee_id || '',
      date_from: date_from || '',
      date_to: date_to || ''
    };
    const result = await employeeCashTransactionsService.getAllTransactions(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching employee cash transactions:', error);
    res.status(500).json({ success: false, error: req.t('finance.failedFetchTransactions') });
  }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
  try {
    const result = await employeeCashTransactionsService.getTransactionById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ success: false, error: req.t('finance.failedFetchTransaction') });
  }
};

// Create new transaction
const createTransaction = async (req, res) => {
  try {
    const { 
      employee_id, 
      amount, 
      type, 
      description,
      client_id,
      bank_account_id,
      case_id,
      department_id,
      project_id,
      attachments 
    } = req.body;
    
    const created_by = req.user?.id || req.userId || null;
    
    console.log('=== Create Transaction ===');
    console.log('Client ID:', client_id);
    console.log('Employee ID:', employee_id);
    
    const result = await employeeCashTransactionsService.createTransaction({ 
      employee_id, 
      amount, 
      type, 
      description,
      client_id,
      bank_account_id,
      case_id,
      department_id,
      project_id,
      attachments,
      created_by 
    });
    
    console.log('Create result:', result);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ success: false, error: req.t('finance.failedCreateTransaction') });
  }
};

// Update transaction
const updateTransaction = async (req, res) => {
  try {
    const { 
      employee_id, 
      amount, 
      type, 
      description,
      client_id,
      bank_account_id,
      case_id,
      department_id,
      project_id,
      attachments,
      status
    } = req.body;
    
    const updated_by = req.user?.id || req.userId || null;
    
    // If only status is being updated (approve/reject)
    if (status && !employee_id && !amount && !type) {
      const result = await employeeCashTransactionsService.updateTransactionStatus(req.params.id, { 
        status,
        updated_by 
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      return res.json(result);
    }
    
    // Otherwise, full transaction update
    // Note: bank_account_id is NOT included in updates - it's set only at creation
    const result = await employeeCashTransactionsService.updateTransaction(req.params.id, { 
      employee_id, 
      amount, 
      type, 
      description,
      client_id,
      bank_account_id,
      case_id,
      department_id,
      project_id,
      attachments,
      updated_by 
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, error: req.t('finance.failedUpdateTransaction') });
  }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
  try {
    const result = await employeeCashTransactionsService.deleteTransaction(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, error: req.t('finance.failedDeleteTransaction') });
  }
};

// Delete attachment
const deleteAttachment = async (req, res) => {
  try {
    const { transactionId, attachmentId } = req.params;
    const result = await employeeCashTransactionsService.deleteAttachment(transactionId, attachmentId);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ success: false, error: req.t('finance.failedDeleteAttachment') });
  }
};

// Get transaction statistics for charts
const getTransactionStatistics = async (req, res) => {
  try {
    const { 
      period,        // 'last_month', 'last_3_months', 'last_6_months', 'last_year', 'custom'
      date_from,     // For custom date range
      date_to,       // For custom date range
      type,          // 'credit', 'debit', or 'both' (default)
      employee_id,   // Filter by specific employee
      group_by       // 'day', 'week', 'month' (default: day)
    } = req.query;
    
    const filters = {
      period: period || 'last_month',
      date_from: date_from || null,
      date_to: date_to || null,
      type: type || 'both',
      employee_id: employee_id || null,
      group_by: group_by || 'day'
    };
    
    const result = await employeeCashTransactionsService.getTransactionStatistics(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching transaction statistics:', error);
    res.status(500).json({ success: false, error: req.t('finance.failedFetchTransactionStatistics') });
  }
};

const getExpensesByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const expenses = await employeeCashTransactionsService.getExpensesByClientId(clientId);
    
    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      success: false,
      message: req.t('finance.failedFetchExpenses')
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAttachment,
  getTransactionStatistics,
  getExpensesByClientId
};
