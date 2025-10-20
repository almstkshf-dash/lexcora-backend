// caseTypesService.js
// Service functions for case types

const caseTypesModel = require('../models/caseTypesModel');

const getAllCaseTypes = async () => {
  return await caseTypesModel.getAllCaseTypes();
};

const createCaseType = async (type) => {
  return await caseTypesModel.createCaseType(type);
};
const updateCaseType = async (id, type) => {
  return await caseTypesModel.updateCaseType(id, type);
};

const deleteCaseType = async (id) => {
  return await caseTypesModel.deleteCaseType(id);
};

module.exports = {
  getAllCaseTypes,
  createCaseType,
  updateCaseType,
  deleteCaseType
};
