const employeeCashTransactionsService = require('../services/employeeCashTransactionsService');

// Get all employee cash transactions
const getAllTransactions = async (req, res) => {
  try {
    const { page, limit, search, type } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || '',
      type: type || ''
    };
    const result = await employeeCashTransactionsService.getAllTransactions(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching employee cash transactions:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch transactions' });
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
    res.status(500).json({ success: false, error: 'Failed to fetch transaction' });
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
      bank_account_id,
      attachments 
    } = req.body;
    
    console.log('=== Create Transaction Request ===');
    console.log('Request Body:', req.body);
    console.log('Attachments received:', attachments);
    console.log('Attachments type:', typeof attachments);
    console.log('Attachments length:', attachments?.length);
    
    const created_by = req.user?.id || req.userId || null;
    
    const result = await employeeCashTransactionsService.createTransaction({ 
      employee_id, 
      amount, 
      type, 
      description,
      bank_account_id,
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
    res.status(500).json({ success: false, error: 'Failed to create transaction' });
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
      bank_account_id,
      attachments 
    } = req.body;
    
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await employeeCashTransactionsService.updateTransaction(req.params.id, { 
      employee_id, 
      amount, 
      type, 
      description,
      bank_account_id,
      attachments,
      updated_by 
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, error: 'Failed to update transaction' });
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
    res.status(500).json({ success: false, error: 'Failed to delete transaction' });
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
    res.status(500).json({ success: false, error: 'Failed to delete attachment' });
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
