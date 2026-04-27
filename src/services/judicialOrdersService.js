// judicialOrdersService.js
// Service functions for judicial orders

const judicialOrdersModel = require('../models/judicialOrdersModel');
const { deleteDocumentFiles } = require('./storageService');

const getAllJudicialOrders = async () => {
  return await judicialOrdersModel.getAllJudicialOrders();
};

const createJudicialOrder = async (judicialOrder) => {
  const files = judicialOrder.files || [];
  try {
    const judicialOrderId = await judicialOrdersModel.createJudicialOrder(judicialOrder);
    for (const file of files) {
      await judicialOrdersModel.addJudicialOrderDocument(judicialOrderId, file.document_name, file.document_url);
    }
    return judicialOrderId;
  } catch (error) {
    throw error;
  }
};

const updateJudicialOrder = async (id, judicialOrder) => {
  const files = judicialOrder.files || [];
  try {
    const success = await judicialOrdersModel.updateJudicialOrder(id, judicialOrder);
    if (success) {
      for (const file of files) {
        await judicialOrdersModel.addJudicialOrderDocument(id, file.document_name, file.document_url);
      }
    }
    return success;
  } catch (error) {
    console.error("Error updating judicial order:", error);
    throw error;
  }
};

const deleteJudicialOrder = async (id) => {
  try {
    // Get judicial order documents before deleting
    const judicialOrder = await judicialOrdersModel.getJudicialOrderById(id);
    const documents = judicialOrder?.documents || [];
    
    // Delete from database (CASCADE will delete document records)
    const result = await judicialOrdersModel.deleteJudicialOrder(id);
    
    // Delete files from AWS S3
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteJudicialOrder:', error);
    throw error;
  }
};

const getJudicialOrderById = async (id) => {
  return await judicialOrdersModel.getJudicialOrderById(id);
};

const getJudicialOrdersByAuthenticationDate = async (authenticationDate) => {
  return await judicialOrdersModel.getJudicialOrdersByAuthenticationDate(authenticationDate);
};

const getJudicialOrdersByNotificationPeriod = async (notificationPeriodDays) => {
  return await judicialOrdersModel.getJudicialOrdersByNotificationPeriod(notificationPeriodDays);
};

const getJudicialOrdersByCaseId = async (caseId) => {
  return await judicialOrdersModel.getJudicialOrdersByCaseId(caseId);
};

const deleteJudicialOrderDocument = async (id) => {
  try {
    // Get the document details before deleting
    const documentToDelete = await judicialOrdersModel.getJudicialOrderDocumentById(id);
    
    // Delete from database
    const result = await judicialOrdersModel.deleteJudicialOrderDocument(id);
    
    // Delete file from AWS S3
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteJudicialOrderDocument:', error);
    throw error;
  }
};

module.exports = {
  getAllJudicialOrders,
  createJudicialOrder,
  updateJudicialOrder,
  deleteJudicialOrder,
  getJudicialOrderById,
  getJudicialOrdersByAuthenticationDate,
  getJudicialOrdersByNotificationPeriod,
  getJudicialOrdersByCaseId,
  deleteJudicialOrderDocument
};