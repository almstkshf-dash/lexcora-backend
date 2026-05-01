// casesService.js
// Service functions for cases

const e = require('express');
const casesModel = require('../models/casesModel');
const courtsModel = require('../models/courtsModel');
const employeeModel = require('../models/employeeModel');
const { deleteDocumentFiles } = require('./storageService');
const { logAdd, logUpdate, logDelete } = require('./logsService');
const { sendCaseNotification } = require('../utils/notificationHelper');
const { sendSystemNotification } = require('../utils/notificationHelper');
const { generateFileNumber } = require('../utils/generateFileNumber');
const db = require('../config/db');

const addCase = async (caseData, createdBy = null) => {
  // return null;
  const uploaded_by = createdBy;
  try {

    // Duplicate validation
    const duplicate = await casesModel.findDuplicateCase(caseData.case_number, caseData.file_number);
    if (duplicate) {
      throw new Error('Case with the same case_number or file_number already exists');
    }
    
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
    
    // Send system notification for case creation
    if (createdBy) {
      try {
        const employeeData = await employeeModel.getEmployeeById(createdBy);
        const employeeName = employeeData?.name || 'Employee';
        await sendCaseNotification({
          action: 'created',
          caseNumber: caseData.file_number || caseData.case_number || `File #${caseData.file_number}`,
          employeeName,
          createdBy
        });
      } catch (notificationError) {
        console.error('Error sending case creation notification:', notificationError);
      }
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
  // Duplicate validation
  const duplicate = await casesModel.findDuplicateCase(caseData.case_number, caseData.file_number, id);
  if (duplicate) {
    throw new Error('Case with the same case_number or file_number already exists');
  }

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
      
      // Send system notification for case update
      try {
        const employeeData = await employeeModel.getEmployeeById(updatedBy);
        const employeeName = employeeData?.name || 'Employee';
        await sendCaseNotification({
          action: 'updated',
          caseNumber: currentCase.file_number || currentCase.case_number || `Case #${id}`,
          employeeName,
          createdBy: updatedBy
        });
      } catch (notificationError) {
        console.error('Error sending case update notification:', notificationError);
      }
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

/**
 * Delete case and send system notification (controller-thin helper)
 */
const deleteCaseWithNotification = async (id, deletedBy = null, deletedByName = 'User') => {
  // Attempt to fetch for notification; ignore failures
  let caseNumber = `Case #${id}`;
  try {
    const existing = await casesModel.getCaseById(id);
    if (existing) {
      caseNumber = existing.case_number || existing.file_number || caseNumber;
    }
  } catch (err) {
    console.warn('Could not fetch case before delete for notification:', err.message);
  }

  const result = await deleteCase(id, deletedBy);

  if (result && deletedBy) {
    try {
      await sendSystemNotification({
        title: '?? ??? ???',
        message: `${deletedByName} ??? ???? ?????: ${caseNumber}`,
        type: 'warning',
        relatedType: 'none',
        createdBy: deletedBy
      });
    } catch (notifError) {
      console.error('Error sending case deletion notification:', notifError);
    }
  }

  return result;
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

const updateCaseAdditionalNote = async (caseId, additionalNote, updatedBy = null) => {
  try {
    const success = await casesModel.updateCaseAdditionalNote(caseId, additionalNote);
    
    // Log the update
    if (success && updatedBy) {
      const caseInfo = await casesModel.getCaseById(caseId);
      await logUpdate(
        updatedBy, 
        'قضية - ملاحظة إضافية', 
        caseInfo?.file_number || caseInfo?.case_number || `القضية ${caseId}`,
        caseId
      );
    }
    
    return success;
  } catch (error) {
    console.error('Error in updateCaseAdditionalNote service:', error);
    throw error;
  }
};

const createCaseWithRelations = async (data, createdBy = null) => {
  const connection = await db.getConnection();
  
  try {
    // Start transaction
    await connection.beginTransaction();

    // 1. Create the case
    const caseData = data.caseData;
    
    // Generate file_number automatically using the utility function
    const fileNumber = generateFileNumber();
    const start_date = new Date().toISOString().split('T')[0];
    
    const [caseResult] = await connection.query(
      `INSERT INTO cases (
        file_number, case_number, police_station_id, public_prosecution_id, court_id,
        lawyer_id, secretary_id, case_classification_id, case_type_id,
        legal_advisor_id, legal_researcher_id, counter_case_id, fees, start_date,
        additional_note, topic, branch_id, is_important, is_secret,
        is_archived, is_pending
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fileNumber, caseData.case_number, caseData.police_station_id, caseData.public_prosecution_id,
        caseData.court_id, caseData.lawyer_id, caseData.secretary_id,
        caseData.case_classification_id, caseData.case_type_id, caseData.legal_advisor_id,
        caseData.legal_researcher_id, caseData.counter_case_id, caseData.fees, start_date,
        caseData.additional_note, caseData.topic, caseData.branch_id,
        caseData.is_important, caseData.is_secret, caseData.is_archived,
        caseData.is_pending
      ]
    );

    const caseId = caseResult.insertId;

    // 2. Add case documents
    const files = Array.isArray(caseData.files) ? caseData.files : [];
    for (const file of files) {
      await connection.query(
        'INSERT INTO case_documents (case_id, document_name, document_url, uploaded_by) VALUES (?, ?, ?, ?)',
        [caseId, file.document_name, file.document_url, createdBy]
      );
    }

    // 3. Add court documents
    const courtFiles = Array.isArray(caseData.courtFiles) ? caseData.courtFiles : [];
    for (const file of courtFiles) {
      await connection.query(
        'INSERT INTO court_case_documents (case_id, document_name, document_url, uploaded_by) VALUES (?, ?, ?, ?)',
        [caseId, file.document_name, file.document_url, createdBy]
      );
    }

    // 4. Add employee documents
    const employeesFiles = Array.isArray(caseData.employeesFiles) ? caseData.employeesFiles : [];
    for (const file of employeesFiles) {
      await connection.query(
        'INSERT INTO case_employees_documents (case_id, document_name, document_url, uploaded_by) VALUES (?, ?, ?, ?)',
        [caseId, file.document_name, file.document_url, createdBy]
      );
    }

    // 5. Add related cases
    // Persist related case links in the existing related_cases table
    // so they match getRelatedCases() and updateCase() behavior.
    const relatedCases = Array.isArray(caseData.related_cases) ? caseData.related_cases : [];
    for (const relatedCase of relatedCases) {
      let relatedCaseId = null;

      if (typeof relatedCase === 'number') {
        relatedCaseId = relatedCase;
      } else if (typeof relatedCase === 'string' && /^\d+$/.test(relatedCase)) {
        relatedCaseId = Number(relatedCase);
      } else if (relatedCase && typeof relatedCase === 'object') {
        if (relatedCase.id) {
          relatedCaseId = Number(relatedCase.id);
        } else if (relatedCase.related_case_id) {
          relatedCaseId = Number(relatedCase.related_case_id);
        } else if (relatedCase.file_number) {
          relatedCaseId = await casesModel.getCaseIdFromFileNumber(relatedCase.file_number);
        }
      }

      if (!relatedCaseId) {
        continue;
      }

      await connection.query(
        'INSERT INTO related_cases (case_id, related_case_id) VALUES (?, ?)',
        [caseId, relatedCaseId]
      );
    }

    // 6. Add parties
    const parties = Array.isArray(data.parties) ? data.parties : [];
    for (const party of parties) {
      await connection.query(
        'INSERT INTO case_parties (case_id, party_id, type, employee_id) VALUES (?, ?, ?, ?)',
        [caseId, party.id, party.type, createdBy]
      );

      // Add party documents
      const partyFiles = Array.isArray(party.files) ? party.files : [];
      for (const file of partyFiles) {
        await connection.query(
          'INSERT INTO case_parties_documents (case_id, party_id, document_name, document_url, uploaded_by) VALUES (?, ?, ?, ?, ?)',
          [caseId, party.id, file.document_name, file.document_url, createdBy]
        );
      }
    }

    // 7. Add case degrees
    const caseDegrees = Array.isArray(data.caseDegrees) ? data.caseDegrees : [];
    for (const degree of caseDegrees) {
      await connection.query(
        `INSERT INTO case_degrees (case_id, degree, case_number, year, referral_date, client_status, opponent_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [caseId, degree.degree, degree.case_number, degree.year, degree.referral_date, 
         degree.client_status, degree.opponent_status]
      );
    }

    // 8. Add petitions
    const petitions = Array.isArray(data.petitions) ? data.petitions : [];
    for (const petition of petitions) {
      const [petitionResult] = await connection.query(
        'INSERT INTO case_petitions (case_id, date, decision, type, appeal_date) VALUES (?, ?, ?, ?, ?)',
        [caseId, petition.submissionDate, petition.judgeDecision, petition.orderType, petition.appealDate]
      );

      const petitionId = petitionResult.insertId;
      const petitionFiles = Array.isArray(petition.files) ? petition.files : [];
      for (const file of petitionFiles) {
        await connection.query(
          'INSERT INTO case_petition_documents (petition_id, document_name, document_url) VALUES (?, ?, ?)',
          [petitionId, file.document_name, file.document_url]
        );
      }
    }

    // 9. Add sessions
    const sessions = Array.isArray(data.sessions) ? data.sessions : [];
    for (const session of sessions) {
      const [sessionResult] = await connection.query(
        `INSERT INTO sessions (case_id, session_date, link, is_expert_session, note, decision)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [caseId, session.date, session.link, session.isExpertSession, session.note, session.decision]
      );

      const sessionId = sessionResult.insertId;
      const sessionFiles = Array.isArray(session.files) ? session.files : [];
      for (const file of sessionFiles) {
        await connection.query(
          'INSERT INTO session_documents (session_id, document_name, document_url) VALUES (?, ?, ?)',
          [sessionId, file.document_name, file.document_url]
        );
      }
    }

    // 10. Add executions
    const executions = Array.isArray(data.executions) ? data.executions : [];
    for (const execution of executions) {
      const [executionResult] = await connection.query(
        'INSERT INTO executions (case_id, date, type, status, amount, employee_id) VALUES (?, ?, ?, ?, ?, ?)',
        [caseId, execution.date, execution.type, execution.status, execution.amount, createdBy]
      );

      const executionId = executionResult.insertId;
      const executionFiles = Array.isArray(execution.attachedFiles) ? execution.attachedFiles : [];
      for (const file of executionFiles) {
        await connection.query(
          'INSERT INTO executions_documents (execution_id, document_name, document_url) VALUES (?, ?, ?)',
          [executionId, file.document_name, file.document_url]
        );
      }
    }

    // 11. Add judicial notices
    const judicialNotices = Array.isArray(data.judicialNotices) ? data.judicialNotices : [];
    for (const notice of judicialNotices) {
      const [noticeResult] = await connection.query(
        `INSERT INTO judicial_orders (case_id, date, notification_period_days, case_filed, service_completed)
         VALUES (?, ?, ?, ?, ?)`,
        [caseId, notice.certificationDate, notice.noticePeriod, notice.lawsuitFiled, notice.noticeCompleted]
      );

      const noticeId = noticeResult.insertId;
      const noticeFiles = Array.isArray(notice.files) ? notice.files : [];
      for (const file of noticeFiles) {
        await connection.query(
          'INSERT INTO judicial_orders_documents (judicial_order_id, document_name, document_url) VALUES (?, ?, ?)',
          [noticeId, file.document_name, file.document_url]
        );
      }
    }

    // 12. Add tasks
    const tasks = Array.isArray(data.tasks) ? data.tasks : [];
    for (const task of tasks) {
      const [taskResult] = await connection.query(
        'INSERT INTO tasks (case_id, title, description, assigned_to, assigned_by, due_date, priority) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [caseId, task.title, task.description, task.assignedTo, createdBy, task.dueDate, task.priority]
      );

      const taskId = taskResult.insertId;
      const taskFiles = Array.isArray(task.files) ? task.files : [];
      for (const file of taskFiles) {
        await connection.query(
          'INSERT INTO task_documents (task_id, document_name, document_url) VALUES (?, ?, ?)',
          [taskId, file.document_name, file.document_url]
        );
      }
    }

    // 13. Add memos
    const memos = Array.isArray(data.memos) ? data.memos : [];
    for (const memo of memos) {
      const [memoResult] = await connection.query(
        `INSERT INTO memos (case_id, title, submission_date, description, status, admin_note, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [caseId, memo.title, memo.submission_date, memo.description, memo.status, memo.admin_note, createdBy]
      );

      const memoId = memoResult.insertId;
      const memoFiles = Array.isArray(memo.files) ? memo.files : [];
      for (const file of memoFiles) {
        await connection.query(
          'INSERT INTO memo_documents (memo_id, document_name, document_url, uploaded_by) VALUES (?, ?, ?, ?)',
          [memoId, file.document_name, file.document_url, createdBy]
        );
      }
    }

    // Commit transaction
    await connection.commit();

    // Log case creation
    if (createdBy) {
      await logAdd(
        createdBy,
        'قضية',
        caseData.file_number || caseData.case_number || 'قضية جديدة',
        caseId
      );
    }

    // Send notification
    if (createdBy) {
      try {
        const employeeData = await employeeModel.getEmployeeById(createdBy);
        const employeeName = employeeData?.name || 'Employee';
        await sendCaseNotification({
          action: 'created',
          caseNumber: caseData.file_number || caseData.case_number || `Case #${caseId}`,
          employeeName,
          createdBy
        });
      } catch (notificationError) {
        console.error('Error sending case creation notification:', notificationError);
      }
    }

    return { caseId };
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    console.error('Error in createCaseWithRelations service:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  addCase,
  getAllCases,
  getCaseById,
  getAllCaseDetails,
  updateCase,
  deleteCase,
  deleteCaseWithNotification,
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
  updateCaseAdditionalNote,
  createCaseWithRelations
};
