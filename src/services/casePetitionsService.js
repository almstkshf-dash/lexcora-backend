// casePetitionsService.js
// Service functions for case petitions

const casePetitionsModel = require('../models/casePetitionsModel');
const { deleteDocumentFiles } = require('./cloudflareService');

const addCasePetition = async (petitionData) => {
  const files = petitionData.files || [];
  try {
    const petition = await casePetitionsModel.addCasePetition(petitionData);
   for (const file of files) {
     await casePetitionsModel.addCasePetitionDocument(petition.id, file.document_name, file.document_url);
   }
   return petition;

  } catch (error) {
    console.error('Error in addCasePetition service:', error);
    throw error;
  }
};

const getAllCasePetitions = async () => {
  try {
    return await casePetitionsModel.getAllCasePetitions();
  } catch (error) {
    console.error('Error in getAllCasePetitions service:', error);
    throw error;
  }
};

const getCasePetitionById = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('Invalid petition ID');
    }
const documents = await casePetitionsModel.getCasePetitionDocuments(id);
    const petition = await casePetitionsModel.getCasePetitionById(id);
    if (!petition) {
      throw new Error('Case petition not found');
    }

    return {  ...petition, documents };
  } catch (error) {
    console.error('Error in getCasePetitionById service:', error);
    throw error;
  }
};

const getCasePetitionsByCaseId = async (caseId) => {
  try {
    if (!caseId || isNaN(caseId)) {
      throw new Error('Invalid case ID');
    }

    return await casePetitionsModel.getCasePetitionsByCaseId(caseId);
  } catch (error) {
    console.error('Error in getCasePetitionsByCaseId service:', error);
    throw error;
  }
};

const updateCasePetition = async (id, petitionData) => {
  try {
const files = petitionData.files || [];
if (files.length > 0) {

  await Promise.all(
    files.map(file => 
      casePetitionsModel.addCasePetitionDocument(id, file.document_name, file.document_url)
    )
  );
    //  for (const file of files) {
    //    await casePetitionsModel.addCasePetitionDocument(id, file.document_name, file.document_url);
    //  }
    }
    return await casePetitionsModel.updateCasePetition(id, petitionData);
  } catch (error) {
    console.error('Error in updateCasePetition service:', error);
    throw error;
  }
};

const deleteCasePetition = async (id) => {
  try {
    if (!id || isNaN(id)) {
      throw new Error('Invalid petition ID');
    }
    const documents = await casePetitionsModel.getCasePetitionDocuments(id);
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }

    return await casePetitionsModel.deleteCasePetition(id);
  } catch (error) {
    console.error('Error in deleteCasePetition service:', error);
    throw error;
  }
};

const getCasePetitionsByDecision = async (decision) => {
  try {
    const validDecisions = ['accepted', 'rejected'];
    if (!validDecisions.includes(decision)) {
      throw new Error('Invalid decision. Must be either "accepted" or "rejected"');
    }

    return await casePetitionsModel.getCasePetitionsByDecision(decision);
  } catch (error) {
    console.error('Error in getCasePetitionsByDecision service:', error);
    throw error;
  }
};

const getCasePetitionsByDateRange = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      throw new Error('Both start date and end date are required');
    }

    // Validate date format (basic validation)
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid date format');
    }

    if (start > end) {
      throw new Error('Start date cannot be later than end date');
    }

    return await casePetitionsModel.getCasePetitionsByDateRange(startDate, endDate);
  } catch (error) {
    console.error('Error in getCasePetitionsByDateRange service:', error);
    throw error;
  }
};

const getCasePetitionStatistics = async () => {
  try {
    const [accepted, rejected, total] = await Promise.all([
      casePetitionsModel.getCasePetitionsByDecision('accepted'),
      casePetitionsModel.getCasePetitionsByDecision('rejected'),
      casePetitionsModel.getAllCasePetitions()
    ]);

    return {
      total: total.length,
      accepted: accepted.length,
      rejected: rejected.length,
      acceptanceRate: total.length > 0 ? (accepted.length / total.length * 100).toFixed(2) : 0
    };
  } catch (error) {
    console.error('Error in getCasePetitionStatistics service:', error);
    throw error;
  }
};

const deleteCasePetitionDocument = async (documentId) => {
  try {
    if (!documentId || isNaN(documentId)) {
      throw new Error('Invalid document ID');
    }
    const existingDocument = await casePetitionsModel.getCasePetitionDocumentById(documentId);
    if (existingDocument) {
      await deleteDocumentFiles([existingDocument]);
    }
    return await casePetitionsModel.deleteCasePetitionDocument(documentId);
  } catch (error) {
    console.error('Error in deleteCasePetitionDocument service:', error);
    throw error;
  }
};

module.exports = {
  addCasePetition,
  getAllCasePetitions,
  getCasePetitionById,
  getCasePetitionsByCaseId,
  updateCasePetition,
  deleteCasePetition,
  getCasePetitionsByDecision,
  getCasePetitionsByDateRange,
  getCasePetitionStatistics,
  deleteCasePetitionDocument,
};