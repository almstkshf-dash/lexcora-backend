
const caseClassificationsModel = require('../models/caseClassificationsModel');

const getAllCaseClassifications = async () => {
  return await caseClassificationsModel.getAllCaseClassifications();
};

const createCaseClassification = async (classification) => {
  return await caseClassificationsModel.createCaseClassification(classification);
};

const updateCaseClassification = async (id, classification) => {
  return await caseClassificationsModel.updateCaseClassification(id, classification);
};

const deleteCaseClassification = async (id) => {
  return await caseClassificationsModel.deleteCaseClassification(id);
};

module.exports = {
  getAllCaseClassifications,
  createCaseClassification,
  updateCaseClassification,
  deleteCaseClassification
};
