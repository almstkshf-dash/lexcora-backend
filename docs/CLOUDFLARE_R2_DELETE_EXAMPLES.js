// Example implementations for common services

// ============================================
// 1. PARTIES SERVICE EXAMPLE
// ============================================
const partiesModel = require('../models/partiesModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const deleteParty = async (id) => {
  try {
    // Get party documents before deleting
    const documents = await partiesModel.getPartyDocuments(id);
    
    // Delete from database
    const result = await partiesModel.deleteParty(id);
    
    // Delete files from R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting party');
  }
};

const deletePartyDocument = async (documentId, partyId) => {
  try {
    // Get the specific document
    const documents = await partiesModel.getPartyDocuments(partyId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    // Delete from database
    const result = await partiesModel.deletePartyDocument(documentId, partyId);
    
    // Delete file from R2
    if (documentToDelete) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting party document');
  }
};

// ============================================
// 2. CASES SERVICE EXAMPLE
// ============================================
const casesModel = require('../models/casesModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const deleteCase = async (id) => {
  try {
    // Get all case-related documents before deleting
    const caseDocuments = await casesModel.getCaseDocuments(id);
    const courtDocuments = await casesModel.getCourtCaseDocuments(id);
    const petitionDocuments = await casesModel.getCasePetitions(id);
    
    // Combine all documents
    const allDocuments = [
      ...caseDocuments,
      ...courtDocuments,
      ...(petitionDocuments || [])
    ];
    
    // Delete from database (CASCADE will handle related records)
    const result = await casesModel.deleteCase(id);
    
    // Delete all files from R2
    if (allDocuments.length > 0) {
      await deleteDocumentFiles(allDocuments);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting case');
  }
};

const deleteCaseDocument = async (documentId, caseId) => {
  try {
    // Get the specific document
    const documents = await casesModel.getCaseDocuments(caseId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    // Delete from database
    const result = await casesModel.deleteCaseDocument(documentId, caseId);
    
    // Delete file from R2
    if (documentToDelete) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting case document');
  }
};

// ============================================
// 3. COURT CASE DOCUMENTS SERVICE EXAMPLE
// ============================================
const courtCaseDocumentsModel = require('../models/courtCaseDocumentsModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const deleteCourtCaseDocument = async (id) => {
  try {
    // Get document details before deleting
    const document = await courtCaseDocumentsModel.getCourtCaseDocumentById(id);
    
    // Delete from database
    const result = await courtCaseDocumentsModel.deleteCourtCaseDocument(id);
    
    // Delete file from R2
    if (document) {
      await deleteDocumentFiles([document]);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting court case document');
  }
};

// ============================================
// 4. CASE PETITIONS SERVICE EXAMPLE
// ============================================
const casePetitionsModel = require('../models/casePetitionsModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const deleteCasePetition = async (id) => {
  try {
    // Get petition documents before deleting
    const documents = await casePetitionsModel.getPetitionDocuments(id);
    
    // Delete from database
    const result = await casePetitionsModel.deleteCasePetition(id);
    
    // Delete files from R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting case petition');
  }
};

// ============================================
// 5. MEETINGS SERVICE EXAMPLE
// ============================================
const meetingsModel = require('../models/meetingsModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const deleteMeeting = async (id) => {
  try {
    // Get meeting documents before deleting
    const documents = await meetingsModel.getMeetingDocuments(id);
    
    // Delete from database
    const result = await meetingsModel.deleteMeeting(id);
    
    // Delete files from R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting meeting');
  }
};

// ============================================
// 6. CLIENT REQUESTS SERVICE EXAMPLE
// ============================================
const clientRequestsModel = require('../models/clientRequestsModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const deleteClientRequest = async (id) => {
  try {
    // Get request documents before deleting
    const documents = await clientRequestsModel.getRequestDocuments(id);
    
    // Delete from database
    const result = await clientRequestsModel.deleteClientRequest(id);
    
    // Delete files from R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting client request');
  }
};

// ============================================
// 7. GENERIC EXAMPLE - Use this pattern
// ============================================
const yourModel = require('../models/yourModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const deleteYourEntity = async (id) => {
  try {
    // 1️⃣ Get documents BEFORE deleting (important!)
    const documents = await yourModel.getDocuments(id);
    
    // 2️⃣ Delete from database (CASCADE removes DB records)
    const result = await yourModel.delete(id);
    
    // 3️⃣ Delete files from Cloudflare R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting entity');
  }
};

// ============================================
// NOTES:
// ============================================
// 1. Always get documents BEFORE database delete
// 2. CASCADE will delete DB records automatically
// 3. deleteDocumentFiles() handles R2 cleanup
// 4. Works with any document format that has document_url field
// 5. Safe to use even if documents array is empty
