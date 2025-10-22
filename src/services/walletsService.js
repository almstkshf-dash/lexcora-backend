const walletsModel = require('../models/walletsModel');

const getAllWallets = async () => {
  try {
    return await walletsModel.getAllWallets();
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

module.exports = {
  getAllWallets,
  getWalletById,
  getWalletsByClientId,
  createWallet,
  updateWallet,
  deleteWallet,
  updateWalletBalance
};