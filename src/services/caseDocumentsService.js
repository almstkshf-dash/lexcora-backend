const caseDocumentsModel = require("../models/caseDocumentsModel");
const { deleteDocumentFiles } = require('./awsS3Service');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllCaseDocuments = async () => {
  try {
    return await caseDocumentsModel.getAllCaseDocuments();
  } catch (error) {
    throw new Error(`Error fetching case documents: ${error.message}`);
  }
};

const createCaseDocument = async (caseDocumentData, createdBy = null) => {
  try {
    const { url, name, case_id } = caseDocumentData;
    
    if (!url || !name || !case_id) {
      throw new Error("URL, name, and case_id are required fields");
    }

    const docId = await caseDocumentsModel.createCaseDocument(caseDocumentData);
    
    // Log document creation
    if (createdBy) {
      await logAdd(
        createdBy,
        'مستند قضية',
        name || 'مستند جديد',
        docId
      );
    }
    
    return docId;
  } catch (error) {
    throw new Error(`Error creating case document: ${error.message}`);
  }
};

const updateCaseDocument = async (id, caseDocumentData, updatedBy = null) => {
  try {
    if (!id) {
      throw new Error("Case document ID is required");
    }

    const existingDocument = await caseDocumentsModel.getCaseDocumentById(id);
    if (!existingDocument) {
      throw new Error("Case document not found");
    }

    const result = await caseDocumentsModel.updateCaseDocument(id, caseDocumentData);
    
    // Log document update
    if (updatedBy) {
      await logUpdate(
        updatedBy,
        'مستند قضية',
        existingDocument.name || 'مستند',
        id
      );
    }
    
    return result;
  } catch (error) {
    throw new Error(`Error updating case document: ${error.message}`);
  }
};

const deleteCaseDocument = async (id, deletedBy = null) => {
  try {
    if (!id) {
      throw new Error("Case document ID is required");
    }

    const existingDocument = await caseDocumentsModel.getCaseDocumentById(id);
    if (!existingDocument) {
      throw new Error("Case document not found");
    }

    // Delete from database
    const result = await caseDocumentsModel.deleteCaseDocument(id);
    
    // Delete file from AWS S3
    if (existingDocument && existingDocument.url) {
      await deleteDocumentFiles([{ document_url: existingDocument.url }]);
    }
    
    // Log document deletion
    if (deletedBy) {
      await logDelete(
        deletedBy,
        'مستند قضية',
        existingDocument.name || 'مستند',
        id
      );
    }

    return result;
  } catch (error) {
    throw new Error(`Error deleting case document: ${error.message}`);
  }
};

const getCaseDocumentById = async (id) => {
  try {
    if (!id) {
      throw new Error("Case document ID is required");
    }

    const document = await caseDocumentsModel.getCaseDocumentById(id);
    if (!document) {
      throw new Error("Case document not found");
    }

    return document;
  } catch (error) {
    throw new Error(`Error fetching case document: ${error.message}`);
  }
};

const getCaseDocumentsByCaseId = async (caseId) => {
  try {
    if (!caseId) {
      throw new Error("Case ID is required");
    }

    return await caseDocumentsModel.getCaseDocumentsByCaseId(caseId);
  } catch (error) {
    throw new Error(`Error fetching case documents by case ID: ${error.message}`);
  }
};

module.exports = {
  getAllCaseDocuments,
  createCaseDocument,
  updateCaseDocument,
  deleteCaseDocument,
  getCaseDocumentById,
  getCaseDocumentsByCaseId
};