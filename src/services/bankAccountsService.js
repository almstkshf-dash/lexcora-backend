const bankAccountsModel = require('../models/bankAccountsModel');

const getAllBankAccounts = async () => {
  return await bankAccountsModel.getAllBankAccounts();
};

const getBankAccountById = async (id) => {
  return await bankAccountsModel.getBankAccountById(id);
};

const createBankAccount = async (bankAccount) => {
  return await bankAccountsModel.createBankAccount(bankAccount);
};

const updateBankAccount = async (id, bankAccount) => {
  return await bankAccountsModel.updateBankAccount(id, bankAccount);
};

const deleteBankAccount = async (id) => {
  return await bankAccountsModel.deleteBankAccount(id);
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
