const walletsModel = require('../models/walletsModel');

const getWalletStats = async () => {
  try {
    return await walletsModel.getWalletStats();
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    throw error;
  }
};

const getAllWallets = async (filters) => {
  try {
    return await walletsModel.getAllWallets(filters);
  } catch (error) {
    console.error('Error fetching all wallets:', error);
    throw error;
  }
};

const getWalletById = async (id) => {
  return await walletsModel.getWalletById(id);
};

const getWalletsByClientId = async (clientId) => {
  return await walletsModel.getWalletsByClientId(clientId);
};

const createWallet = async (wallet) => {
  return await walletsModel.createWallet(wallet);
};

const updateWallet = async (id, wallet) => {
  return await walletsModel.updateWallet(id, wallet);
};

const deleteWallet = async (id) => {
  return await walletsModel.deleteWallet(id);
};

const updateWalletBalance = async (id, amount, operation, updated_by) => {
  return await walletsModel.updateWalletBalance(id, amount, operation, updated_by);
};

const getAccountStatement = async (walletId, fromDate, toDate) => {
  return await walletsModel.getAccountStatement(walletId, fromDate, toDate);
};

module.exports = {
  getAllWallets,
  getWalletById,
  getWalletsByClientId,
  createWallet,
  updateWallet,
  deleteWallet,
  updateWalletBalance,
  getWalletStats,
  getAccountStatement
};