// casesController.js
// Thin controllers delegating to services

const casesService = require('../services/casesService');
const sessionsService = require('../services/sessionsService');
const { normalizePagination } = require('../utils/pagination');

const addCase = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    const caseId = await casesService.addCase(req.body, createdBy);
    return res.created({ caseId }, 'Case created successfully');
  } catch (error) {
    console.error('Error creating case:', error);
    return res.fail('Failed to create case', 500, 'CASE_CREATE_ERROR', { error: error.message });
  }
};

const getAllCases = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = normalizePagination(
      req.query,
      ['start_date', 'id', 'case_number', 'file_number', 'created_at']
    );
    const { branchId, fileNumber, caseNumber } = req.query;
    const fromDate = req.query.fromDate ? new Date(req.query.fromDate).toISOString().split('T')[0] : undefined;
    const toDate = req.query.toDate ? new Date(req.query.toDate).toISOString().split('T')[0] : undefined;

    const filters = {
      page,
      limit,
      branchId,
      fromDate,
      toDate,
      fileNumber,
      caseNumber,
      sortBy,
      sortOrder
    };

    const result = await casesService.getAllCases(filters);
    return res.success(result.cases, req.t('generic.ok'), 200, {
      pagination: result.pagination,
      stats: result.stats
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return res.fail('Failed to fetch cases', 500, 'CASES_LIST_ERROR');
  }
};

const getCaseById = async (req, res) => {
  try {
    const data = await casesService.getCaseById(req.params.id);
    if (!data) return res.fail('Case not found', 404, 'NOT_FOUND');
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch case', 500, 'CASE_GET_ERROR');
  }
};

const getAllCaseDetails = async (req, res) => {
  try {
    const caseId = req.params.id;
    if (!caseId) return res.fail('Case ID is required', 400, 'VALIDATION_ERROR');
    const details = await casesService.getAllCaseDetails(caseId);
    if (!details) return res.fail('Case not found', 404, 'NOT_FOUND');
    return res.success(details, 'Case details retrieved successfully');
  } catch (error) {
    console.error('Error fetching case details:', error);
    return res.fail('Failed to fetch case details', 500, 'CASE_DETAILS_ERROR');
  }
};

const updateCase = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const success = await casesService.updateCase(req.params.id, req.body, updatedBy);
    if (!success) return res.fail('Case not found', 404, 'NOT_FOUND');
    return res.success(null, 'Case updated successfully');
  } catch (error) {
    return res.fail('Failed to update case', 500, 'CASE_UPDATE_ERROR');
  }
};

const deleteCase = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const deletedByName = req.user ? (req.user.employeeName || req.user.username || 'User') : 'User';
    const success = await casesService.deleteCaseWithNotification(req.params.id, deletedBy, deletedByName);
    if (!success) return res.fail('Case not found', 404, 'NOT_FOUND');
    return res.success(null, 'Case deleted successfully');
  } catch (error) {
    return res.fail('Failed to delete case', 500, 'CASE_DELETE_ERROR');
  }
};

const getCasesByBranch = async (req, res) => {
  try {
    const data = await casesService.getCasesByBranch(req.params.branchId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch cases by branch', 500, 'CASES_BRANCH_ERROR');
  }
};

const getCasesByLawyer = async (req, res) => {
  try {
    const data = await casesService.getCasesByLawyer(req.params.lawyerId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch cases by lawyer', 500, 'CASES_LAWYER_ERROR');
  }
};

const getCasesByLegalAdvisor = async (req, res) => {
  try {
    const data = await casesService.getCasesByLegalAdvisor(req.params.legalAdvisorId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch cases by legal advisor', 500, 'CASES_ADVISOR_ERROR');
  }
};

const getCasesByLegalResearcher = async (req, res) => {
  try {
    const data = await casesService.getCasesByLegalResearcher(req.params.legalResearcherId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch cases by legal researcher', 500, 'CASES_RESEARCHER_ERROR');
  }
};

const addPartyToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { party_id, type } = req.body;
    if (!party_id || !type) return res.fail('party_id and type are required', 400, 'VALIDATION_ERROR');
    const result = await casesService.addCaseParty(caseId, req.body);
    return res.created(result || null, 'Party added to case successfully');
  } catch (error) {
    console.error('Error adding party to case:', error);
    return res.fail('Failed to add party to case', 500, 'CASE_PARTY_ADD_ERROR');
  }
};

const deletePartyFromCase = async (req, res) => {
  try {
    const { caseId, partyId } = req.params;
    const result = await casesService.deleteCaseParty(caseId, partyId);
    return res.success(result || null, 'Party removed from case successfully');
  } catch (error) {
    return res.fail('Failed to remove party from case', 500, 'CASE_PARTY_DELETE_ERROR');
  }
};

const searchCasesForAddNewCasePage = async (req, res) => {
  try {
    const data = await casesService.searchCasesForAddNewCasePage(req.query.q || '');
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to search cases', 500, 'CASE_SEARCH_ERROR');
  }
};

const getCaseParties = async (req, res) => {
  try {
    const data = await casesService.getCaseParties(req.params.caseId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch case parties', 500, 'CASE_PARTIES_ERROR');
  }
};

const getCaseSessions = async (req, res) => {
  try {
    const { caseId } = req.params;
    if (!caseId) return res.fail('Case ID is required', 400, 'VALIDATION_ERROR');
    const sessions = await sessionsService.getSessionsByCase(caseId);
    return res.success(sessions, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch case sessions', 500, 'CASE_SESSIONS_ERROR');
  }
};

const getEmployeesCaseDocuments = async (req, res) => {
  try {
    const docs = await casesService.getEmployeesCaseDocuments(req.params.id);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch employee case documents', 500, 'CASE_EMP_DOCS_ERROR');
  }
};

const deleteEmployeeCaseDocument = async (req, res) => {
  try {
    const success = await casesService.deleteEmployeeCaseDocument(req.params.id, req.params.documentId);
    if (!success) return res.fail('Document not found', 404, 'NOT_FOUND');
    return res.success(null, 'Employee case document deleted');
  } catch (error) {
    return res.fail('Failed to delete employee case document', 500, 'CASE_EMP_DOC_DELETE_ERROR');
  }
};

const getCaseDocuments = async (req, res) => {
  try {
    const docs = await casesService.getCaseDocuments(req.params.id);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch case documents', 500, 'CASE_DOCS_ERROR');
  }
};

const deleteCaseDocument = async (req, res) => {
  try {
    const success = await casesService.deleteCaseDocument(req.params.id, req.params.documentId);
    if (!success) return res.fail('Document not found', 404, 'NOT_FOUND');
    return res.success(null, 'Case document deleted');
  } catch (error) {
    return res.fail('Failed to delete case document', 500, 'CASE_DOC_DELETE_ERROR');
  }
};

const getCaseCourtDocuments = async (req, res) => {
  try {
    const docs = await casesService.getCaseCourtDocuments(req.params.id);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch court documents', 500, 'CASE_COURT_DOCS_ERROR');
  }
};

const deleteCaseCourtDocument = async (req, res) => {
  try {
    const success = await casesService.deleteCaseCourtDocument(req.params.id, req.params.documentId);
    if (!success) return res.fail('Document not found', 404, 'NOT_FOUND');
    return res.success(null, 'Court document deleted');
  } catch (error) {
    return res.fail('Failed to delete court document', 500, 'CASE_COURT_DOC_DELETE_ERROR');
  }
};

const getCasePartyDocuments = async (req, res) => {
  try {
    const docs = await casesService.getCasePartyDocuments(req.params.id, req.params.partyId);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    return res.fail('Failed to fetch party documents', 500, 'CASE_PARTY_DOCS_ERROR');
  }
};

const addCasePartyDocument = async (req, res) => {
  try {
    const result = await casesService.addCasePartyDocument(req.params.id, req.params.partyId, req.body);
    return res.created(result || null, 'Case party document added');
  } catch (error) {
    return res.fail('Failed to add party document', 500, 'CASE_PARTY_DOC_ADD_ERROR');
  }
};

const deleteCasePartyDocument = async (req, res) => {
  try {
    const success = await casesService.deleteCasePartyDocument(req.params.id, req.params.partyId, req.params.documentId);
    if (!success) return res.fail('Document not found', 404, 'NOT_FOUND');
    return res.success(null, 'Case party document deleted');
  } catch (error) {
    return res.fail('Failed to delete party document', 500, 'CASE_PARTY_DOC_DELETE_ERROR');
  }
};

const updateCaseAdditionalNote = async (req, res) => {
  try {
    const { additional_note } = req.body;
    if (additional_note === undefined) return res.fail('additional_note is required', 400, 'VALIDATION_ERROR');
    const updatedBy = req.user ? req.user.id : null;
    const success = await casesService.updateCaseAdditionalNote(req.params.id, additional_note, updatedBy);
    if (!success) return res.fail('Case not found', 404, 'NOT_FOUND');
    return res.success(null, 'Additional note updated successfully');
  } catch (error) {
    return res.fail('Failed to update additional note', 500, 'CASE_NOTE_UPDATE_ERROR');
  }
};

const createCaseWithRelations = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    const { caseData, parties, caseDegrees, petitions, sessions, executions, judicialNotices, tasks, memos } = req.body;
    if (!caseData) return res.fail('Case data is required', 400, 'VALIDATION_ERROR');

    const result = await casesService.createCaseWithRelations({
      caseData,
      parties: parties || [],
      caseDegrees: caseDegrees || [],
      petitions: petitions || [],
      sessions: sessions || [],
      executions: executions || [],
      judicialNotices: judicialNotices || [],
      tasks: tasks || [],
      memos: memos || []
    }, createdBy);

    return res.created({ caseId: result.caseId }, 'Case and all relations created successfully');
  } catch (error) {
    console.error('Error creating case with relations:', error);
    return res.fail('Failed to create case with relations', 500, 'CASE_BATCH_CREATE_ERROR', { error: error.message });
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
  addPartyToCase,
  deletePartyFromCase,
  searchCasesForAddNewCasePage,
  getCaseParties,
  getCaseSessions,
  getEmployeesCaseDocuments,
  deleteEmployeeCaseDocument,
  getCaseDocuments,
  deleteCaseDocument,
  getCaseCourtDocuments,
  deleteCaseCourtDocument,
  getCasePartyDocuments,
  addCasePartyDocument,
  deleteCasePartyDocument,
  updateCaseAdditionalNote,
  createCaseWithRelations
};

