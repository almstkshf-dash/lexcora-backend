const clientsDealsModel = require('../models/clientsDealsModel');
const { deleteDocumentFiles } = require('./awsS3Service');

const getAllClientsDeals = async (filters) => {
  return await clientsDealsModel.getAllClientsDeals(filters);
};

const getClientDealById = async (id) => {
  const deal = await clientsDealsModel.getClientDealById(id);
  if (deal) {
    // Get deal documents
    deal.documents = await clientsDealsModel.getDealDocuments(id);
  }
  return deal;
};

const getClientDealsByClientId = async (clientId) => {
  return await clientsDealsModel.getClientDealsByClientId(clientId);
};

const createClientDeal = async (data, files = []) => {
  // Create the deal first
  const dealId = await clientsDealsModel.createClientDeal(data);
  
  // Create documents if files are provided
  if (files && files.length > 0) {
    const documents = files.map(file => ({
      deal_id: dealId,
      document_name: file.document_name,
      document_url: file.document_url,
      created_by: data.created_by || null
    }));
    
    await clientsDealsModel.createDealDocuments(documents);
  }
  
  return dealId;
};

const updateClientDeal = async (id, data, files = []) => {
  // Update the deal
  const updated = await clientsDealsModel.updateClientDeal(id, data);
  
  // Add new documents if files are provided
  if (files && files.length > 0) {
    const documents = files.map(file => ({
      deal_id: id,
      document_name: file.document_name,
      document_url: file.document_url,
      created_by: data.created_by || null
    }));
    
    await clientsDealsModel.createDealDocuments(documents);
  }
  
  return updated;
};

const deleteClientDeal = async (id) => {
  // Get deal documents before deleting
  const documents = await clientsDealsModel.getDealDocuments(id);
  
  // Delete from database (CASCADE will handle related records)
  const deleted = await clientsDealsModel.deleteClientDeal(id);
  
  // Delete files from AWS S3
  if (documents && documents.length > 0) {
    await deleteDocumentFiles(documents);
  }
  
  return deleted;
};

const deleteDealDocument = async (documentId, dealId) => {
  // Get the specific document
  const documents = await clientsDealsModel.getDealDocuments(dealId);
  const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
  
  // Delete from database
  const deleted = await clientsDealsModel.deleteDealDocument(documentId);
  
  // Delete file from AWS S3
  if (documentToDelete) {
    await deleteDocumentFiles([documentToDelete]);
  }
  
  return deleted;
};

module.exports = {
  getAllClientsDeals,
  getClientDealById,
  getClientDealsByClientId,
  createClientDeal,
  updateClientDeal,
  deleteClientDeal,
  deleteDealDocument
};