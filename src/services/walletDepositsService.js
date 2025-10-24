const walletDepositsModel = require('../models/walletDepositsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

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

const createWalletDeposit = async (deposit, createdBy = null) => {
  const result = await walletDepositsModel.createWalletDeposit(deposit);
  
  // Log wallet deposit creation
  if (createdBy && result.success) {
    await logAdd(
      createdBy,
      'إيداع محفظة',
      `إيداع بمبلغ ${deposit.amount || 'جديد'}`,
      result.data?.id
    );
  }
  
  return result;
};

const updateWalletDeposit = async (id, deposit, updatedBy = null) => {
  const result = await walletDepositsModel.updateWalletDeposit(id, deposit);
  
  // Log wallet deposit update
  if (updatedBy && result.success) {
    await logUpdate(
      updatedBy,
      'إيداع محفظة',
      `إيداع رقم ${id}`,
      id
    );
  }
  
  return result;
};

const deleteWalletDeposit = async (id, deletedBy = null) => {
  // Get wallet deposit details before deletion
  let deposit = null;
  if (deletedBy) {
    try {
      const depositResult = await walletDepositsModel.getWalletDepositById(id);
      if (depositResult.success) {
        deposit = depositResult.data;
      }
    } catch (error) {
      console.error('Error getting wallet deposit:', error);
    }
  }
  
  const result = await walletDepositsModel.deleteWalletDeposit(id);
  
  // Log wallet deposit deletion
  if (deletedBy && result.success && deposit) {
    await logDelete(
      deletedBy,
      'إيداع محفظة',
      `إيداع بمبلغ ${deposit.amount || id}`,
      id
    );
  }
  
  return result;
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
