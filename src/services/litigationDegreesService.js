// litigationDegreesService.js
// Service functions for litigation degrees

const litigationDegreesModel = require('../models/litigationDegreesModel');

const getAllLitigationDegrees = async () => {
  return await litigationDegreesModel.getAllLitigationDegrees();
};

const createLitigationDegree = async (litigationDegree) => {
  return await litigationDegreesModel.createLitigationDegree(litigationDegree);
};

const updateLitigationDegree = async (id, litigationDegree) => {
  return await litigationDegreesModel.updateLitigationDegree(id, litigationDegree);
};

const deleteLitigationDegree = async (id) => {
  return await litigationDegreesModel.deleteLitigationDegree(id);
};

const getLitigationDegreeById = async (id) => {
  return await litigationDegreesModel.getLitigationDegreeById(id);
};

const getLitigationDegreesByYear = async (year) => {
  return await litigationDegreesModel.getLitigationDegreesByYear(year);
};

const getLitigationDegreesByCaseNumber = async (caseNumber) => {
  return await litigationDegreesModel.getLitigationDegreesByCaseNumber(caseNumber);
};

module.exports = {
  getAllLitigationDegrees,
  createLitigationDegree,
  updateLitigationDegree,
  deleteLitigationDegree,
  getLitigationDegreeById,
  getLitigationDegreesByYear,
  getLitigationDegreesByCaseNumber
};