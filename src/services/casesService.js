// casesService.js
// Service functions for cases

const e = require('express');
const casesModel = require('../models/casesModel');
const courtsModel = require('../models/courtsModel');
const employeeModel = require('../models/employeeModel');
const { deleteDocumentFiles } = require('./awsS3Service');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const addCase = async (caseData, createdBy = null) => {
  // return null;
  const uploaded_by = createdBy;
  try {

    
    const caseId = await casesModel.addCase(caseData);
    const files = caseData.files || [];
    const courtFiles = caseData.courtFiles || [];
    const employeesFiles = caseData.employeesFiles || [];
    for (const file of files) {
      await casesModel.addCaseDocument(caseId, file.document_name, file.document_url, uploaded_by);
    }
    for (const file of courtFiles) {
      await courtsModel.addCaseCourtDocument(caseId, file.document_name, file.document_url, uploaded_by);
    }
    for (const file of employeesFiles) {
      await employeeModel.addCaseEmployeeDocument(caseId, file.document_name, file.document_url, uploaded_by);
    }
    
    // Log case creation
    if (createdBy) {
      await logAdd(
        createdBy, 
        'قضية', 
        caseData.file_number || caseData.case_number || 'قضية جديدة', 
        caseId
      );
    }
    
    return caseId;
  } catch (error) {
    console.error('Error in addCase service:', error);
    throw error;
  }
};

const updateCase = async (id, caseData, updatedBy = null) => {
  const updated_by = updatedBy;
  const relatedCases = caseData.related_cases || [];
  await casesModel.clearRelatedCases(id);
  await Promise.all(relatedCases.map(async (relatedCase) => {
    const relatedCaseId = await casesModel.getCaseIdFromFileNumber(relatedCase.file_number);
    await casesModel.addRelatedCase(id, relatedCaseId);
  }));
  const files = caseData.files || [];
  const courtFiles = caseData.courtFiles || [];
  const employeesFiles = caseData.employeesFiles || [];
  for (const file of files) {
    await casesModel.addCaseDocument(id, file.document_name, file.document_url, updated_by);
  }
  for (const file of courtFiles) {
    await courtsModel.addCaseCourtDocument(id, file.document_name, file.document_url, updated_by);
  }
  for (const file of employeesFiles) {
    await employeeModel.addCaseEmployeeDocument(id, file.document_name, file.document_url, updated_by);
  }
  
  const result = await casesModel.updateCase(id, caseData);
  
  // Log case update
  if (updatedBy) {
    const currentCase = await casesModel.getCaseById(id);
    if (currentCase) {
      await logUpdate(
        updatedBy, 
        'قضية', 
        currentCase.file_number || currentCase.case_number || 'قضية', 
        id
      );
    }
  }
  
  return result;
};

const getAllCases = async (filters = {}) => {
  try {
    return await casesModel.getAllCases(filters);
  } catch (error) {
    console.error('Error in getAllCases service:', error);
    throw error;
  }
};

const getCaseById = async (id) => {
  try {
    const relatedCases = await casesModel.getRelatedCases(id);
    // console.log("Related Cases:", relatedCases);
    const caseDetails = await casesModel.getCaseById(id);
    return { ...caseDetails, relatedCases };
  } catch (error) {
    console.error("Error in getCaseById service:", error);
    throw error;
  }
};

const getAllCaseDetails = async (id) => {
  try {
    return await casesModel.getAllCaseDetails(id);
  } catch (error) {
    console.error('Error in getAllCaseDetails service:', error);
    throw error;
  }
};

const deleteCase = async (id, deletedBy = null) => {
  /**
   * Delete a case and all its related data including:
   * - Case documents
   * - Employee case documents
   * - Court case documents
   * - Case party documents (for all parties)
   * - Session documents (for all sessions)
   * - Task documents (for all tasks)
   * - Memo documents (for all memos)
   * - Petition documents (for all petitions)
   * - Execution documents (for all executions)
   * - Judicial order documents (for all judicial orders)
   * 
   * All documents are deleted from AWS S3 storage before the case is deleted from the database.
   * Database CASCADE constraints will automatically delete related records (sessions, tasks, memos, etc.)
   */
  
  // Get case details before deletion for logging
  let caseDetails = null;
  if (deletedBy) {
    try {
      caseDetails = await casesModel.getCaseById(id);
    } catch (error) {
      console.error('Error getting case for logging:', error);
    }
  }
  
  try {
    // Collect all documents related to this case for deletion from AWS S3
    const allDocuments = [];
    
    // 1. Get case documents
    const caseDocuments = await casesModel.getCaseDocuments(id);
    if (caseDocuments && caseDocuments.length > 0) {
      allDocuments.push(...caseDocuments.map(doc => ({
        document_url: doc.document_url || doc.url
      })));
    }
    
    // 2. Get employee case documents
    const employeeDocuments = await casesModel.getEmployeesCaseDocuments(id);
    if (employeeDocuments && employeeDocuments.length > 0) {
      allDocuments.push(...employeeDocuments.map(doc => ({
        document_url: doc.document_url || doc.url
      })));
    }
    
    // 3. Get court case documents
    const courtDocuments = await casesModel.getCaseCourtDocuments(id);
    if (courtDocuments && courtDocuments.length > 0) {
      allDocuments.push(...courtDocuments.map(doc => ({
        document_url: doc.document_url || doc.url
      })));
    }
    
    // 4. Get case party documents for all parties
    const caseParties = await casesModel.getCaseParties(id);
    if (caseParties && caseParties.length > 0) {
      for (const party of caseParties) {
        const partyDocuments = await casesModel.getCasePartyDocuments(id, party.party_id);
        if (partyDocuments && partyDocuments.length > 0) {
          allDocuments.push(...partyDocuments.map(doc => ({
            document_url: doc.document_url || doc.url
          })));
        }
      }
    }
    
    // 5. Get session documents
    const sessionsModel = require('../models/sessionsModel');
    const sessions = await sessionsModel.getSessionsByCase(id);
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        const sessionDocuments = await sessionsModel.getSessionDocuments(session.id);
        if (sessionDocuments && sessionDocuments.length > 0) {
          allDocuments.push(...sessionDocuments.map(doc => ({
            document_url: doc.document_url || doc.url
          })));
        }
      }
    }
    
    // 6. Get task documents
    const tasksModel = require('../models/tasksModel');
    const tasks = await tasksModel.getTasksByCaseId(id);
    if (tasks && tasks.length > 0) {
      for (const task of tasks) {
        const taskDocuments = await tasksModel.getTaskDocuments(task.id);
        if (taskDocuments && taskDocuments.length > 0) {
          allDocuments.push(...taskDocuments.map(doc => ({
            document_url: doc.document_url || doc.url
          })));
        }
      }
    }
    
    // 7. Get memo documents
    const memosModel = require('../models/memosModel');
    const memos = await memosModel.getMemosByCaseId(id);
    if (memos && memos.length > 0) {
      for (const memo of memos) {
        const memoDocuments = await memosModel.getDocumentsByMemoId(memo.id);
        if (memoDocuments && memoDocuments.length > 0) {
          allDocuments.push(...memoDocuments.map(doc => ({
            document_url: doc.document_url || doc.url
          })));
        }
      }
    }
    
    // 8. Get petition documents
    const casePetitionsModel = require('../models/casePetitionsModel');
    const petitions = await casePetitionsModel.getCasePetitionsByCaseId(id);
    if (petitions && petitions.length > 0) {
      for (const petition of petitions) {
        const petitionDocuments = await casePetitionsModel.getCasePetitionDocuments(petition.id);
        if (petitionDocuments && petitionDocuments.length > 0) {
          allDocuments.push(...petitionDocuments.map(doc => ({
            document_url: doc.document_url || doc.url
          })));
        }
      }
    }
    
    // 9. Get execution documents
    const executionsModel = require('../models/executionsModel');
    const executions = await executionsModel.getExecutionsByCaseId(id);
    if (executions && executions.length > 0) {
      for (const execution of executions) {
        const executionDetails = await executionsModel.getExecutionById(execution.id);
        if (executionDetails && executionDetails.documents && executionDetails.documents.length > 0) {
          allDocuments.push(...executionDetails.documents.map(doc => ({
            document_url: doc.document_url || doc.url
          })));
        }
      }
    }
    
    // 10. Get judicial order documents
    const judicialOrdersModel = require('../models/judicialOrdersModel');
    const judicialOrders = await judicialOrdersModel.getJudicialOrdersByCaseId(id);
    if (judicialOrders && judicialOrders.length > 0) {
      for (const order of judicialOrders) {
        const orderDetails = await judicialOrdersModel.getJudicialOrderById(order.id);
        if (orderDetails && orderDetails.documents && orderDetails.documents.length > 0) {
          allDocuments.push(...orderDetails.documents.map(doc => ({
            document_url: doc.document_url || doc.url
          })));
        }
      }
    }
    
    // Delete all documents from AWS S3 storage
    if (allDocuments.length > 0) {
      await deleteDocumentFiles(allDocuments);
    }
    
    // Delete the case from database (CASCADE will delete all related records)
    const result = await casesModel.deleteCase(id);
    
    // Log case deletion
    if (deletedBy && caseDetails) {
      await logDelete(
        deletedBy, 
        'قضية', 
        caseDetails.file_number || caseDetails.case_number || 'قضية', 
        id
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteCase service:', error);
    throw error;
  }
};

const getCasesByBranch = async (branchId) => {
  return await casesModel.getCasesByBranch(branchId);
};

const getCasesByLawyer = async (lawyerId) => {
  return await casesModel.getCasesByLawyer(lawyerId);
};

const getCasesByLegalAdvisor = async (legalAdvisorId) => {
  return await casesModel.getCasesByLegalAdvisor(legalAdvisorId);
};

const getCasesByLegalResearcher = async (legalResearcherId) => {
  return await casesModel.getCasesByLegalResearcher(legalResearcherId);
};

const addCaseParty = async (caseId, partyData) => {
  try {
    const { party_id, type } = partyData;
     await casesModel.addCaseParty(caseId, party_id, type);
     if(partyData.files && partyData.files.length > 0){
      const uploaded_by = null;
      for (const file of partyData.files) {
        await casesModel.addCasePartyDocument(caseId, party_id, file.document_name, file.document_url, uploaded_by);
      }
    }
  } catch (error) {
    console.error('Error in addCaseParty service:', error);
    throw error;
  }
};
const updateCaseParty = async (caseId, partyId, partyData) => {
  try {

    await casesModel.updateCaseParty(caseId, partyId, partyData);
    if(partyData.files && partyData.files.length > 0){
      const uploaded_by = null;
      for (const file of partyData.files) {
        await casesModel.addCasePartyDocument(caseId, partyId, file.document_name, file.document_url, uploaded_by);
      }
    }
  } catch (error) {
    console.error('Error in updateCaseParty service:', error);
    throw error;
  }
};

const deleteCaseParty = async (caseId, partyId) => {
  try {
    const documents = await casesModel.getCasePartyDocuments(caseId, partyId);
    
    // Delete from database (CASCADE will delete document records)
    const result = await casesModel.deleteCaseParty(caseId, partyId);
    
    // Delete files from AWS S3
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteCaseParty service:', error);
    throw error;
  }
};

const searchCasesForAddNewCasePage = async (searchTerm) => {
  try {
    return await casesModel.searchCasesForAddNewCasePage(searchTerm);
  } catch (error) {
    console.error('Error in searchCasesForAddNewCasePage service:', error);
    throw error;
  }
};

const getCaseParties = async (caseId) => {
  try {
    return await casesModel.getCaseParties(caseId);
  } catch (error) {
    console.error('Error in getCaseParties service:', error);
    throw error;
  }
};

const getEmployeesCaseDocuments = async (caseId) => {
  try {
    const documents = await employeeModel.getCaseEmployeeDocuments(caseId);
    return documents;
  } catch (error) {
    console.error('Error in getEmployeesCaseDocuments service:', error);
    throw error;
  }
};

const deleteEmployeeCaseDocument = async (caseId, documentId) => {
  try {
    // Get all employee documents for the case to find the specific one
    const documents = await employeeModel.getCaseEmployeeDocuments(caseId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    // Delete from database
    const isDeleted = await employeeModel.deleteCaseEmployeeDocument(documentId, caseId);
    
    // Delete file from AWS S3
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return isDeleted;
  } catch (error) {
    console.error('Error in deleteEmployeeCaseDocument service:', error);
    throw error;
  }
};

const getCaseDocuments = async (caseId) => {
  try {
    const documents = await casesModel.getCaseDocuments(caseId);
    return documents;
  } catch (error) {
    console.error('Error in getCaseDocuments service:', error);
    throw error;
  }
};

const deleteCaseDocument = async (caseId, documentId) => {
  try {
    // Get all case documents to find the specific one
    const documents = await casesModel.getCaseDocuments(caseId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    // Delete from database
    const isDeleted = await casesModel.deleteCaseDocument(documentId, caseId);
    
    // Delete file from AWS S3
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return isDeleted;
  } catch (error) {
    console.error('Error in deleteCaseDocument service:', error);
    throw error;
  }
};

const getCaseCourtDocuments = async (caseId) => {
  try {
    const documents = await casesModel.getCaseCourtDocuments(caseId);
    return documents;
  } catch (error) {
    console.error('Error in getCaseCourtDocuments service:', error);
    throw error;
  }
};

const deleteCaseCourtDocument = async (caseId, documentId) => {
  try {
    // Get all court documents for the case to find the specific one
    const documents = await casesModel.getCaseCourtDocuments(caseId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    // Delete from database
    const isDeleted = await casesModel.deleteCaseCourtDocument(documentId, caseId);
    
    // Delete file from AWS S3
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return isDeleted;
  } catch (error) {
    console.error('Error in deleteCaseCourtDocument service:', error);
    throw error;
  }
};

const getCasePartyDocuments = async (caseId, partyId) => {
  try {
    const documents = await casesModel.getCasePartyDocuments(caseId, partyId);
    return documents;
  } catch (error) {
    console.error('Error in getCasePartyDocuments service:', error);
    throw error;
  }
};

const deleteCasePartyDocument = async (caseId, partyId, documentId) => {
  try {
    
    const document = await casesModel.getCasePartyDocumentById(documentId);
    const isDeleted = await casesModel.deleteCasePartyDocument(documentId, caseId, partyId);
    if (document) {
      await deleteDocumentFiles([document]);
    }
    return isDeleted;
  } catch (error) {
    console.error('Error in deleteCasePartyDocument service:', error);
    throw error;
  }
};

const addCasePartyDocument = async (caseId, partyId, documentData) => {
  try {
    const { files } = documentData;
    const uploaded_by = null; // You may want to get this from req.user or similar
    
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    // Add each file as a case party document
    for (const file of files) {
      await casesModel.addCasePartyDocument(caseId, partyId, file.document_name, file.document_url, uploaded_by);
    }

    return { success: true, message: 'Case party documents added successfully' };
  } catch (error) {
    console.error('Error in addCasePartyDocument service:', error);
    throw error;
  }
};

module.exports = {
  addCase,
  getAllCases,
  getCaseById,
  getAllCaseDetails,
  updateCase,
  deleteCase,
  getCasesByBranch,
  getCasesByLawyer,
  getCasesByLegalAdvisor,
  getCasesByLegalResearcher,
  addCaseParty,
  deleteCaseParty,
  searchCasesForAddNewCasePage,
  getCaseParties,
  getEmployeesCaseDocuments,
  deleteEmployeeCaseDocument,
  getCaseDocuments,
  deleteCaseDocument,
  getCaseCourtDocuments,
  deleteCaseCourtDocument,
  getCasePartyDocuments,
  deleteCasePartyDocument,
  addCasePartyDocument,
};
