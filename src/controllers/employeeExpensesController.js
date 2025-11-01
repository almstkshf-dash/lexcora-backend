const employeeExpensesService = require('../services/employeeExpensesService');

// Get all employee expenses
const getAllExpenses = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search: search || ''
    };
    const result = await employeeExpensesService.getAllExpenses(filters);
    res.json(result);
  } catch (error) {
    console.error('Error fetching employee expenses:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch expenses' });
  }
};

// Get expense by ID
const getExpenseById = async (req, res) => {
  try {
    const result = await employeeExpensesService.getExpenseById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch expense' });
  }
};

// Create new expense
const createExpense = async (req, res) => {
  try {
    const { 
      employee_id, 
      amount, 
      description,
      bank_account_id,
      attachments
    } = req.body;
    
    const created_by = req.user?.id || req.userId || null;
    
    const result = await employeeExpensesService.createExpense({ 
      employee_id, 
      amount, 
      description,
      bank_account_id,
      attachments,
      created_by 
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ success: false, error: 'Failed to create expense' });
  }
};

// Update expense
const updateExpense = async (req, res) => {
  try {
    const { 
      employee_id, 
      amount, 
      description,
      attachments
    } = req.body;
    
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await employeeExpensesService.updateExpense(req.params.id, { 
      employee_id, 
      amount, 
      description,
      attachments,
      updated_by 
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ success: false, error: 'Failed to update expense' });
  }
};

// Delete expense
const deleteExpense = async (req, res) => {
  try {
    const deletedBy = req.user?.id || req.userId || null;
    const result = await employeeExpensesService.deleteExpense(req.params.id, deletedBy);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, error: 'Failed to delete expense' });
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense
};
