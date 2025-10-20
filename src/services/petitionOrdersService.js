// petitionOrdersService.js
// Service functions for petition orders

const petitionOrdersModel = require('../models/petitionOrdersModel');

const getAllPetitionOrders = async () => {
  return await petitionOrdersModel.getAllPetitionOrders();
};

const createPetitionOrder = async (petitionOrder) => {
  return await petitionOrdersModel.createPetitionOrder(petitionOrder);
};

const updatePetitionOrder = async (id, petitionOrder) => {
  return await petitionOrdersModel.updatePetitionOrder(id, petitionOrder);
};

const deletePetitionOrder = async (id) => {
  return await petitionOrdersModel.deletePetitionOrder(id);
};

const getPetitionOrderById = async (id) => {
  return await petitionOrdersModel.getPetitionOrderById(id);
};

const getPetitionOrdersBySubmissionDate = async (submissionDate) => {
  return await petitionOrdersModel.getPetitionOrdersBySubmissionDate(submissionDate);
};

const getPetitionOrdersByOrderType = async (orderType) => {
  return await petitionOrdersModel.getPetitionOrdersByOrderType(orderType);
};

const getPetitionOrdersByJudgeDecision = async (judgeDecision) => {
  return await petitionOrdersModel.getPetitionOrdersByJudgeDecision(judgeDecision);
};

const getPetitionOrdersByLastAppealDate = async (lastAppealDate) => {
  return await petitionOrdersModel.getPetitionOrdersByLastAppealDate(lastAppealDate);
};

module.exports = {
  getAllPetitionOrders,
  createPetitionOrder,
  updatePetitionOrder,
  deletePetitionOrder,
  getPetitionOrderById,
  getPetitionOrdersBySubmissionDate,
  getPetitionOrdersByOrderType,
  getPetitionOrdersByJudgeDecision,
  getPetitionOrdersByLastAppealDate
};