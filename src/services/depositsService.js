const depositsModel = require('../models/depositsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllDeposits = async () => {
  return await depositsModel.getAllDeposits();
};

const getDepositById = async (id) => {
  return await depositsModel.getDepositById(id);
};

const createDeposit = async (deposit, createdBy = null) => {
  const depositId = await depositsModel.createDeposit(deposit);
  
  // Log deposit creation
  if (createdBy) {
    await logAdd(
      createdBy,
      'إيداع',
      deposit.description || deposit.amount || 'إيداع جديد',
      depositId
    );
  }
  
  return depositId;
};

const updateDeposit = async (id, deposit, updatedBy = null) => {
  const currentDeposit = await depositsModel.getDepositById(id);
  const result = await depositsModel.updateDeposit(id, deposit);
  
  // Log deposit update
  if (updatedBy && currentDeposit) {
    await logUpdate(
      updatedBy,
      'إيداع',
      currentDeposit.description || currentDeposit.amount || 'إيداع',
      id
    );
  }
  
  return result;
};

const deleteDeposit = async (id, deletedBy = null) => {
  const deposit = await depositsModel.getDepositById(id);
  const result = await depositsModel.deleteDeposit(id);
  
  // Log deposit deletion
  if (deletedBy && deposit) {
    await logDelete(
      deletedBy,
      'إيداع',
      deposit.description || deposit.amount || 'إيداع',
      id
    );
  }
  
  return result;
};

module.exports = {
  getAllDeposits,
  getDepositById,
  createDeposit,
  updateDeposit,
  deleteDeposit
};
