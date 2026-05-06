// bankAccountsController.js
// Controller functions for bank accounts

const bankAccountsService = require('../services/bankAccountsService');

const getAllBankAccounts = async (req, res) => {
  try {
    const result = await bankAccountsService.getAllBankAccounts();
    res.success(result);
  } catch (error) {
    console.error('[GET_ALL_BANK_ACCOUNTS_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('bank.failedFetchBankAccounts'), 500, 'GET_BANK_ACCOUNTS_FAILED');
  }
};

const getBankAccountById = async (req, res) => {
  try {
    const result = await bankAccountsService.getBankAccountById(req.params.id);
    if (!result.success) {
      return res.fail(req.t('bank.notFound'), 404, 'BANK_ACCOUNT_NOT_FOUND');
    }
    res.success(result.data);
  } catch (error) {
    console.error('[GET_BANK_ACCOUNT_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('bank.failedFetchBankAccount'), 500, 'GET_BANK_ACCOUNT_FAILED');
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
    
    const created_by = req.user?.id || null;
    
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
      return res.fail(result.error || req.t('bank.failedCreateBankAccount'), 400, 'CREATE_BANK_ACCOUNT_INVALID');
    }
    
    res.created(result.data, req.t('bank.bankAccountCreated'));
  } catch (error) {
    console.error('[CREATE_BANK_ACCOUNT_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('bank.failedCreateBankAccount'), 500, 'CREATE_BANK_ACCOUNT_FAILED');
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
    
    const updated_by = req.user?.id || null;
    
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
      return res.fail(req.t('bank.notFound'), 404, 'BANK_ACCOUNT_NOT_FOUND');
    }
    
    res.success(result.data, req.t('bank.bankAccountUpdated'));
  } catch (error) {
    console.error('[UPDATE_BANK_ACCOUNT_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('bank.failedUpdateBankAccount'), 500, 'UPDATE_BANK_ACCOUNT_FAILED');
  }
};

const deleteBankAccount = async (req, res) => {
  try {
    const deleted_by = req.user?.id || null;
    
    const result = await bankAccountsService.deleteBankAccount(req.params.id, deleted_by);
    
    if (!result.success) {
      return res.fail(req.t('bank.notFound'), 404, 'BANK_ACCOUNT_NOT_FOUND');
    }
    
    res.success(null, req.t('bank.bankAccountDeleted'));
  } catch (error) {
    console.error('[DELETE_BANK_ACCOUNT_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('bank.failedDeleteBankAccount'), 500, 'DELETE_BANK_ACCOUNT_FAILED');
  }
};

const updateAccountBalance = async (req, res) => {
  try {
    const { amount, operation } = req.body;
    
    if (!amount || !operation) {
      return res.fail(req.t('finance.validationAmountOperationRequired'), 400, 'INVALID_INPUT');
    }
    
    const result = await bankAccountsService.updateAccountBalance(
      req.params.id, 
      amount, 
      operation
    );
    
    if (!result.success) {
      return res.fail(req.t('bank.notFound'), 404, 'BANK_ACCOUNT_NOT_FOUND');
    }
    
    res.success(result.data, req.t('bank.balanceUpdated'));
  } catch (error) {
    console.error('[UPDATE_BANK_BALANCE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('bank.failedUpdateAccountBalance'), 500, 'UPDATE_BANK_BALANCE_FAILED');
  }
};

// Get all logs for a bank account
const getBankAccountLogs = async (req, res) => {
  try {
    const result = await bankAccountsService.getBankAccountLogs(req.params.id);
    
    if (!result.success) {
      return res.fail(req.t('bank.notFound'), 404, 'BANK_ACCOUNT_NOT_FOUND');
    }
    
    res.success(result.data);
  } catch (error) {
    console.error('[GET_BANK_ACCOUNT_LOGS_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('bank.failedFetchBankAccountLogs'), 500, 'GET_BANK_LOGS_FAILED');
  }
};

// Create a new bank account log with attachments
const createBankAccountLog = async (req, res) => {
  try {
    const { bank_account_id, type, amount, description } = req.body;
    
    if (!bank_account_id || !type || !amount) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    const created_by = req.user?.id || null;
    const files = req.files || [];
    
    let uploadedFiles = [];
    if (files.length > 0) {
      const { uploadToS3 } = require('../utils/s3Upload');
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
      return res.fail(result.error || req.t('bank.failedCreateBankAccountLog'), 400, 'CREATE_BANK_LOG_INVALID');
    }
    
    res.created(result.data, req.t('bank.bankLogCreated'));
  } catch (error) {
    console.error('[CREATE_BANK_ACCOUNT_LOG_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('bank.failedCreateBankAccountLog'), 500, 'CREATE_BANK_LOG_FAILED');
  }
};

// Update a bank account log
const updateBankAccountLog = async (req, res) => {
  try {
    const { type, amount, description, delete_attachments } = req.body;
    
    if (!type || !amount) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    const updated_by = req.user?.id || null;
    const files = req.files || [];
    
    let uploadedFiles = [];
    if (files.length > 0) {
      const { uploadToS3 } = require('../utils/s3Upload');
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
      return res.fail(req.t('bank.logNotFound'), 404, 'BANK_LOG_NOT_FOUND');
    }
    
    res.success(result.data, req.t('bank.bankLogUpdated'));
  } catch (error) {
    console.error('[UPDATE_BANK_ACCOUNT_LOG_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('bank.failedUpdateBankAccountLog'), 500, 'UPDATE_BANK_LOG_FAILED');
  }
};

// Delete a bank account log
const deleteBankAccountLog = async (req, res) => {
  try {
    const deleted_by = req.user?.id || null;
    
    const result = await bankAccountsService.deleteBankAccountLog(req.params.id, deleted_by);
    
    if (!result.success) {
      return res.fail(req.t('bank.logNotFound'), 404, 'BANK_LOG_NOT_FOUND');
    }
    
    res.success(null, req.t('bank.bankLogDeleted'));
  } catch (error) {
    console.error('[DELETE_BANK_ACCOUNT_LOG_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('bank.failedDeleteBankAccountLog'), 500, 'DELETE_BANK_LOG_FAILED');
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
