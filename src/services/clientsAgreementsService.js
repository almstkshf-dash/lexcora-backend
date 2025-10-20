const clientsAgreementsModel = require('../models/clientsAgreementsModel');

const getAllClientsAgreements = async (filters) => {
  return await clientsAgreementsModel.getAllClientsAgreements(filters);
};

const getClientAgreementById = async (id) => {
  return await clientsAgreementsModel.getClientAgreementById(id);
};

const createClientAgreement = async (data) => {
  return await clientsAgreementsModel.createClientAgreement(data);
};

const updateClientAgreement = async (id, data) => {
  return await clientsAgreementsModel.updateClientAgreement(id, data);
};

const deleteClientAgreement = async (id) => {
  return await clientsAgreementsModel.deleteClientAgreement(id);
};

module.exports = {
  getAllClientsAgreements,
  getClientAgreementById,
  createClientAgreement,
  updateClientAgreement,
  deleteClientAgreement
};
