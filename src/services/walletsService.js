const walletsModel = require('../models/walletsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

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

const createWallet = async (wallet, createdBy = null) => {
  const result = await walletsModel.createWallet(wallet);
  
  // Log wallet creation
  if (createdBy && result.success) {
    await logAdd(
      createdBy,
      'محفظة',
      wallet.wallet_name || 'محفظة جديدة',
      result.data?.id
    );
  }
  
  return result;
};

const updateWallet = async (id, wallet, updatedBy = null) => {
  const result = await walletsModel.updateWallet(id, wallet);
  
  // Log wallet update
  if (updatedBy && result.success) {
    await logUpdate(
      updatedBy,
      'محفظة',
      wallet.wallet_name || 'محفظة',
      id
    );
  }
  
  return result;
};

const deleteWallet = async (id, deletedBy = null) => {
  // Get wallet details before deletion
  let wallet = null;
  if (deletedBy) {
    try {
      const walletResult = await walletsModel.getWalletById(id);
      if (walletResult.success) {
        wallet = walletResult.data;
      }
    } catch (error) {
      console.error('Error getting wallet:', error);
    }
  }
  
  const result = await walletsModel.deleteWallet(id);
  
  // Log wallet deletion
  if (deletedBy && result.success && wallet) {
    await logDelete(
      deletedBy,
      'محفظة',
      wallet.wallet_name || 'محفظة',
      id
    );
  }
  
  return result;
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