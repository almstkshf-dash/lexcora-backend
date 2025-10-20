const courtCaseDocumentsModel = require("../models/courtCaseDocumentsModel");
const { deleteDocumentFiles } = require('./cloudflareService');

const getAllCourtCaseDocuments = async () => {
  try {
    return await courtCaseDocumentsModel.getAllCourtCaseDocuments();
  } catch (error) {
    throw new Error(`Error fetching court case documents: ${error.message}`);
  }
};

const createCourtCaseDocument = async (courtCaseDocumentData) => {
  try {
    const { court_id, case_document_id, submission_date, status, notes } = courtCaseDocumentData;
    
    if (!court_id || !case_document_id) {
      throw new Error("Court ID and case document ID are required fields");
    }

    return await courtCaseDocumentsModel.createCourtCaseDocument(courtCaseDocumentData);
  } catch (error) {
    throw new Error(`Error creating court case document: ${error.message}`);
  }
};

const updateCourtCaseDocument = async (id, courtCaseDocumentData) => {
  try {
    if (!id) {
      throw new Error("Court case document ID is required");
    }

    const existingRecord = await courtCaseDocumentsModel.getCourtCaseDocumentById(id);
    if (!existingRecord) {
      throw new Error("Court case document not found");
    }

    return await courtCaseDocumentsModel.updateCourtCaseDocument(id, courtCaseDocumentData);
  } catch (error) {
    throw new Error(`Error updating court case document: ${error.message}`);
  }
};

const deleteCourtCaseDocument = async (id) => {
  try {
    if (!id) {
      throw new Error("Court case document ID is required");
    }

    const existingRecord = await courtCaseDocumentsModel.getCourtCaseDocumentById(id);
    if (!existingRecord) {
      throw new Error("Court case document not found");
    }

    // Delete from database
    const result = await courtCaseDocumentsModel.deleteCourtCaseDocument(id);
    
    // Delete file from R2
    if (existingRecord && existingRecord.url) {
      await deleteDocumentFiles([{ document_url: existingRecord.url }]);
    }

    return result;
  } catch (error) {
    throw new Error(`Error deleting court case document: ${error.message}`);
  }
};

const getCourtCaseDocumentById = async (id) => {
  try {
    if (!id) {
      throw new Error("Court case document ID is required");
    }

    const record = await courtCaseDocumentsModel.getCourtCaseDocumentById(id);
    if (!record) {
      throw new Error("Court case document not found");
    }

    return record;
  } catch (error) {
    throw new Error(`Error fetching court case document: ${error.message}`);
  }
};

const getCourtCaseDocumentsByCourtId = async (courtId) => {
  try {
    if (!courtId) {
      throw new Error("Court ID is required");
    }

    return await courtCaseDocumentsModel.getCourtCaseDocumentsByCourtId(courtId);
  } catch (error) {
    throw new Error(`Error fetching court case documents by court ID: ${error.message}`);
  }
};

const getCourtCaseDocumentsByCaseDocumentId = async (caseDocumentId) => {
  try {
    if (!caseDocumentId) {
      throw new Error("Case document ID is required");
    }

    return await courtCaseDocumentsModel.getCourtCaseDocumentsByCaseDocumentId(caseDocumentId);
  } catch (error) {
    throw new Error(`Error fetching court case documents by case document ID: ${error.message}`);
  }
};

const getCourtCaseDocumentsByStatus = async (status) => {
  try {
    if (!status) {
      throw new Error("Status is required");
    }

    return await courtCaseDocumentsModel.getCourtCaseDocumentsByStatus(status);
  } catch (error) {
    throw new Error(`Error fetching court case documents by status: ${error.message}`);
  }
};

const getCourtCaseDocumentsByDateRange = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      throw new Error("Start date and end date are required");
    }

    return await courtCaseDocumentsModel.getCourtCaseDocumentsByDateRange(startDate, endDate);
  } catch (error) {
    throw new Error(`Error fetching court case documents by date range: ${error.message}`);
  }
};

module.exports = {
  getAllCourtCaseDocuments,
  createCourtCaseDocument,
  updateCourtCaseDocument,
  deleteCourtCaseDocument,
  getCourtCaseDocumentById,
  getCourtCaseDocumentsByCourtId,
  getCourtCaseDocumentsByCaseDocumentId,
  getCourtCaseDocumentsByStatus,
  getCourtCaseDocumentsByDateRange
};