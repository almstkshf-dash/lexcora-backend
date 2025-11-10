const clientsDepositsModel = require("../models/clientsDepositsModel");

const getDepositsByPartyId = async (partyId) => {
  return await clientsDepositsModel.getDepositsByPartyId(partyId);
};

const createDeposit = async (depositData) => {
  return await clientsDepositsModel.createDeposit(depositData);
};

const updateDeposit = async (depositId, depositData) => {
  return await clientsDepositsModel.updateDeposit(depositId, depositData);
};

const deleteDeposit = async (depositId) => {
  return await clientsDepositsModel.deleteDeposit(depositId);
};

const getAccountStatement = async (partyId, dateFrom, dateTo) => {
  return await clientsDepositsModel.getAccountStatement(partyId, dateFrom, dateTo);
};

module.exports = {
  getDepositsByPartyId,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  getAccountStatement
};
