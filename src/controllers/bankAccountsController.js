// bankAccountsController.js
// Controller functions for bank accounts

const bankAccountsService = require('../services/bankAccountsService');

const getAllBankAccounts = async (req, res) => {
  try {
    const result = await bankAccountsService.getAllBankAccounts();
    res.json(result);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bank accounts' });
  }
};

const getBankAccountById = async (req, res) => {
  try {
    const result = await bankAccountsService.getBankAccountById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bank account' });
  }
};

const createBankAccount = async (req, res) => {
  try {
    const { 
      bank_name, 
      account_name, 
      account_number, 
      iban, 
      branch_id, 
      current_balance, 
      status 
    } = req.body;
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || req.userId || null;
    
    const result = await bankAccountsService.createBankAccount({ 
      bank_name, 
      account_name, 
      account_number, 
      iban, 
      branch_id, 
      current_balance, 
      status,
      created_by 
    }, created_by);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating bank account:', error);
    res.status(500).json({ success: false, error: 'Failed to create bank account' });
  }
};

const updateBankAccount = async (req, res) => {
  try {
    const { 
      bank_name, 
      account_name, 
      account_number, 
      iban, 
      branch_id, 
      current_balance, 
      status 
    } = req.body;
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await bankAccountsService.updateBankAccount(req.params.id, { 
      bank_name, 
      account_name, 
      account_number, 
      iban, 
      branch_id, 
      current_balance, 
      status 
    }, updated_by);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating bank account:', error);
    res.status(500).json({ success: false, error: 'Failed to update bank account' });
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    // Get deleted_by from authenticated user
    const deleted_by = req.user?.id || req.userId || null;
    
    const result = await bankAccountsService.deleteBankAccount(req.params.id, deleted_by);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ success: false, error: 'Failed to delete bank account' });
  }
};

const updateAccountBalance = async (req, res) => {
  try {
    const { amount, operation } = req.body;
    
    if (!amount || !operation) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and operation are required' 
      });
    }
    
    const result = await bankAccountsService.updateAccountBalance(
      req.params.id, 
      amount, 
      operation
    );
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating account balance:', error);
    res.status(500).json({ success: false, error: 'Failed to update account balance' });
  }
};

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  updateAccountBalance
};
