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

module.exports = {
  getAllBankAccounts,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  updateAccountBalance
};
