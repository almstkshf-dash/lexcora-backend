const walletDepositsModel = require('../models/walletDepositsModel');

const getAllWalletDeposits = async () => {
  try {
    return await walletDepositsModel.getAllWalletDeposits();
  } catch (error) {
    console.error('Error fetching all wallet deposits:', error);
    throw error;
  }
};

const getWalletDepositById = async (id) => {
  return await walletDepositsModel.getWalletDepositById(id);
};

const getDepositsByWalletId = async (walletId) => {
  return await walletDepositsModel.getDepositsByWalletId(walletId);
};

const getDepositsByClientId = async (clientId) => {
  return await walletDepositsModel.getDepositsByClientId(clientId);
};

const createWalletDeposit = async (deposit) => {
  return await walletDepositsModel.createWalletDeposit(deposit);
};

const updateWalletDeposit = async (id, deposit) => {
  return await walletDepositsModel.updateWalletDeposit(id, deposit);
};

const deleteWalletDeposit = async (id) => {
  return await walletDepositsModel.deleteWalletDeposit(id);
};

module.exports = {
  getAllWalletDeposits,
  getWalletDepositById,
  getDepositsByWalletId,
  getDepositsByClientId,
  createWalletDeposit,
  updateWalletDeposit,
  deleteWalletDeposit
};
