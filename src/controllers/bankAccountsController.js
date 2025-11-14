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

// Get all logs for a bank account
const getBankAccountLogs = async (req, res) => {
  try {
    const result = await bankAccountsService.getBankAccountLogs(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching bank account logs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch bank account logs' });
  }
};

// Create a new bank account log with attachments
const createBankAccountLog = async (req, res) => {
  try {
    const { bank_account_id, type, amount, description } = req.body;
    
    if (!bank_account_id || !type || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Bank account ID, type, and amount are required' 
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || req.userId || null;
    
    // Get uploaded files from multer (these will be in memory)
    const files = req.files || [];
    
    // If files exist, we need to upload them to S3
    let uploadedFiles = [];
    if (files.length > 0) {
      const { uploadToS3 } = require('../utils/s3Upload');
      
      // Upload files to S3
      const uploadPromises = files.map(async (file) => {
        const s3Result = await uploadToS3(file, 'bank-account-logs');
        return {
          originalname: file.originalname,
          location: s3Result.url,
          key: s3Result.key
        };
      });
      
      uploadedFiles = await Promise.all(uploadPromises);
    }
    
    const result = await bankAccountsService.createBankAccountLog({
      bank_account_id,
      type,
      amount,
      description,
      created_by,
      attachments: uploadedFiles
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating bank account log:', error);
    res.status(500).json({ success: false, error: 'Failed to create bank account log' });
  }
};

// Update a bank account log
const updateBankAccountLog = async (req, res) => {
  try {
    const { type, amount, description, delete_attachments } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Type and amount are required' 
      });
    }
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
    // Get uploaded files from multer (these will be in memory)
    const files = req.files || [];
    
    // If files exist, we need to upload them to S3
    let uploadedFiles = [];
    if (files.length > 0) {
      const { uploadToS3 } = require('../utils/s3Upload');
      
      // Upload files to S3
      const uploadPromises = files.map(async (file) => {
        const s3Result = await uploadToS3(file, 'bank-account-logs');
        return {
          originalname: file.originalname,
          location: s3Result.url,
          key: s3Result.key
        };
      });
      
      uploadedFiles = await Promise.all(uploadPromises);
    }
    
    // Parse delete_attachments if it's a string
    let attachmentsToDelete = [];
    if (delete_attachments) {
      try {
        attachmentsToDelete = JSON.parse(delete_attachments);
      } catch (e) {
        attachmentsToDelete = [];
      }
    }
    
    const result = await bankAccountsService.updateBankAccountLog(req.params.id, {
      type,
      amount,
      description,
      updated_by,
      new_attachments: uploadedFiles,
      delete_attachments: attachmentsToDelete
    });
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating bank account log:', error);
    res.status(500).json({ success: false, error: 'Failed to update bank account log' });
  }
};

// Delete a bank account log
const deleteBankAccountLog = async (req, res) => {
  try {
    // Get deleted_by from authenticated user
    const deleted_by = req.user?.id || req.userId || null;
    
    const result = await bankAccountsService.deleteBankAccountLog(req.params.id, deleted_by);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting bank account log:', error);
    res.status(500).json({ success: false, error: 'Failed to delete bank account log' });
  }
};

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  updateAccountBalance,
  getBankAccountLogs,
  createBankAccountLog,
  updateBankAccountLog,
  deleteBankAccountLog
};
