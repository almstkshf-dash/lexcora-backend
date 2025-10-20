const caseDegreesModel = require('../models/caseDegreesModel');

// Get all case degrees
const getAllCaseDegrees = async () => {
  try {
    return await caseDegreesModel.getAllCaseDegrees();
  } catch (error) {
    throw error;
  }
};

// Get case degree by ID
const getCaseDegreeById = async (id) => {
  try {
    return await caseDegreesModel.getCaseDegreeById(id);
  } catch (error) {
    throw error;
  }
};

// Get case degrees by case ID
const getCaseDegreesByCaseId = async (caseId) => {
  try {
    return await caseDegreesModel.getCaseDegreesByCaseId(caseId);
  } catch (error) {
    throw error;
  }
};

// Create case degree
const createCaseDegree = async (caseDegreeData) => {
  try {
    // Validate required fields
    if (!caseDegreeData.case_id || !caseDegreeData.degree) {
      throw new Error('Case ID and degree are required');
    }

    return await caseDegreesModel.createCaseDegree(caseDegreeData);
  } catch (error) {
    throw error;
  }
};

// Update case degree
const updateCaseDegree = async (id, caseDegreeData) => {
  try {
    // Check if case degree exists
    const existingCaseDegree = await caseDegreesModel.getCaseDegreeById(id);
    if (!existingCaseDegree) {
      throw new Error('Case degree not found');
    }

    return await caseDegreesModel.updateCaseDegree(id, caseDegreeData);
  } catch (error) {
    throw error;
  }
};

// Delete case degree
const deleteCaseDegree = async (id) => {
  try {
    // Check if case degree exists
    const existingCaseDegree = await caseDegreesModel.getCaseDegreeById(id);
    if (!existingCaseDegree) {
      throw new Error('Case degree not found');
    }

    return await caseDegreesModel.deleteCaseDegree(id);
  } catch (error) {
    throw error;
  }
};

// Search case degrees
const searchCaseDegrees = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      throw new Error('Search term is required');
    }

    return await caseDegreesModel.searchCaseDegrees(searchTerm);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllCaseDegrees,
  getCaseDegreeById,
  getCaseDegreesByCaseId,
  createCaseDegree,
  updateCaseDegree,
  deleteCaseDegree,
  searchCaseDegrees
};