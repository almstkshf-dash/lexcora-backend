const bankAccountsModel = require('../models/bankAccountsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllBankAccounts = async () => {
  return await bankAccountsModel.getAllBankAccounts();
};

const getBankAccountById = async (id) => {
  return await bankAccountsModel.getBankAccountById(id);
};

const createBankAccount = async (bankAccount, createdBy = null) => {
  const result = await bankAccountsModel.createBankAccount(bankAccount);
  // console.log('Create Bank Account Result:', result);
  // Log bank account creation
  if (createdBy && result.success) {
    await logAdd(
      createdBy,
      'حساب بنكي',
      bankAccount.account_name || 'حساب بنكي جديد',
      result.data?.id
    );
  }
  
  return result;
};

const updateBankAccount = async (id, bankAccount, updatedBy = null) => {
  const result = await bankAccountsModel.updateBankAccount(id, bankAccount);
  
  // Log bank account update
  if (updatedBy && result.success) {
    await logUpdate(
      updatedBy,
      'حساب بنكي',
      bankAccount.account_name || 'حساب بنكي',
      id
    );
  }
  
  return result;
};

const deleteBankAccount = async (id, deletedBy = null) => {
  // Get bank account details before deletion
  let account = null;
  if (deletedBy) {
    try {
      const accountResult = await bankAccountsModel.getBankAccountById(id);
      if (accountResult.success) {
        account = accountResult.data;
      }
    } catch (error) {
      console.error('Error getting bank account:', error);
    }
  }
  
  const result = await bankAccountsModel.deleteBankAccount(id);
  
  // Log bank account deletion
  if (deletedBy && result.success && account) {
    await logDelete(
      deletedBy,
      'حساب بنكي',
      account.account_name || 'حساب بنكي',
      id
    );
  }
  
  return result;
};

const updateAccountBalance = async (id, amount, operation) => {
  return await bankAccountsModel.updateAccountBalance(id, amount, operation);
};

const getBankAccountLogs = async (bankAccountId) => {
  return await bankAccountsModel.getBankAccountLogs(bankAccountId);
};

const createBankAccountLog = async (logData) => {
  const result = await bankAccountsModel.createBankAccountLog(logData);
  
  // Log the bank account log creation
  if (logData.created_by && result.success) {
    const logType = logData.type === 'deposit' ? 'إيداع' : 'سحب';
    await logAdd(
      logData.created_by,
      'سجل حساب بنكي',
      `${logType} - ${logData.amount} درهم`,
      result.data?.id
    );
  }
  
  return result;
};

const updateBankAccountLog = async (logId, updateData) => {
  const result = await bankAccountsModel.updateBankAccountLog(logId, updateData);
  
  // Log the bank account log update
  if (updateData.updated_by && result.success) {
    const logType = updateData.type === 'deposit' ? 'إيداع' : 'سحب';
    await logUpdate(
      updateData.updated_by,
      'سجل حساب بنكي',
      `${logType} - ${updateData.amount} درهم`,
      logId
    );
  }
  
  return result;
};

const deleteBankAccountLog = async (logId, deletedBy = null) => {
  // Get log details before deletion
  let logDetails = null;
  if (deletedBy) {
    try {
      const logsResult = await bankAccountsModel.getBankAccountLogs(null);
      if (logsResult.success) {
        logDetails = logsResult.data.find(log => log.id === parseInt(logId));
      }
    } catch (error) {
      console.error('Error getting log details:', error);
    }
  }
  
  const result = await bankAccountsModel.deleteBankAccountLog(logId);
  
  // Log the bank account log deletion
  if (deletedBy && result.success && logDetails) {
    const logType = logDetails.type === 'deposit' ? 'إيداع' : 'سحب';
    await logDelete(
      deletedBy,
      'سجل حساب بنكي',
      `${logType} - ${logDetails.amount} درهم`,
      logId
    );
  }
  
  return result;
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
