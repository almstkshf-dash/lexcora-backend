// executionsService.js
// Service functions for executions

const executionsModel = require('../models/executionsModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const getAllExecutions = async () => {
  return await executionsModel.getAllExecutions();
};

const createExecution = async (execution) => {
  try {
    const executionId = await executionsModel.createExecution(execution);
    const files = execution.files || [];
    for (const file of files) {
      await executionsModel.addExecutionDocument(executionId, file.document_name, file.document_url);
    }
    return executionId;
  } catch (error) {
    console.error("Error creating execution:", error);
    throw error;
  }
};

const updateExecution = async (id, execution) => {
  const files = execution.files || [];
  for (const file of files) {
    await executionsModel.addExecutionDocument(id, file.document_name, file.document_url);
  }
  return await executionsModel.updateExecution(id, execution);
};

const deleteExecution = async (id) => {
  try {
    // Get execution documents before deleting
    const execution = await executionsModel.getExecutionById(id);
    const documents = execution?.documents || [];
    
    // Delete from database (CASCADE will delete document records)
    const result = await executionsModel.deleteExecution(id);
    
    // Delete files from R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteExecution:', error);
    throw error;
  }
};

const getExecutionById = async (id) => {
  return await executionsModel.getExecutionById(id);
};

const getExecutionsByDate = async (date) => {
  return await executionsModel.getExecutionsByDate(date);
};

const getExecutionsByType = async (type) => {
  return await executionsModel.getExecutionsByType(type);
};

const getExecutionsByStatus = async (status) => {
  return await executionsModel.getExecutionsByStatus(status);
};

const getExecutionsByAmountRange = async (minAmount, maxAmount) => {
  return await executionsModel.getExecutionsByAmountRange(minAmount, maxAmount);
};

const getExecutionsByCaseId = async (caseId) => {
  return await executionsModel.getExecutionsByCaseId(caseId);
};

const deleteExecutionDocument = async (id) => {
  try {
    // Get the document details before deleting
    const documentToDelete = await executionsModel.getExecutionDocumentById(id);
    
    // Delete from database
    const result = await executionsModel.deleteExecutionDocument(id);
    
    // Delete file from R2
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteExecutionDocument:', error);
    throw error;
  }
};

module.exports = {
  getAllExecutions,
  createExecution,
  updateExecution,
  deleteExecution,
  getExecutionById,
  getExecutionsByDate,
  getExecutionsByType,
  getExecutionsByStatus,
  getExecutionsByAmountRange,
  getExecutionsByCaseId,
  deleteExecutionDocument
};