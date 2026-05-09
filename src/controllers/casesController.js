// casesController.js
// Thin controllers delegating to services

const casesService = require('../services/casesService');
const sessionsService = require('../services/sessionsService');
const { normalizePagination } = require('../utils/pagination');
const { isConstraintError, getConstraintErrorMessage } = require('../utils/dbErrors');

const addCase = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    const caseId = await casesService.addCase(req.body, createdBy);
    return res.created({ caseId }, req.t('generic.created'));
  } catch (error) {
    console.error('[ADD_CASE_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    return res.fail(req.t('case.failedCreate'), 500, 'CASE_CREATE_ERROR', { error: error.message });
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
    console.error('[GET_ALL_CASES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    return res.fail(req.t('case.failedFetch'), 500, 'CASES_LIST_ERROR');
  }
};

const getCaseById = async (req, res) => {
  try {
    const data = await casesService.getCaseById(req.params.id);
    if (!data) return res.fail(req.t('case.notFound'), 404, 'NOT_FOUND');
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASE_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_GET_ERROR');
  }
};

const getAllCaseDetails = async (req, res) => {
  try {
    const caseId = req.params.id;
    if (!caseId) return res.fail('Case ID is required', 400, 'VALIDATION_ERROR');
    const details = await casesService.getAllCaseDetails(caseId);
    if (!details) return res.fail(req.t('case.notFound'), 404, 'NOT_FOUND');
    return res.success(details, req.t('case.detailsRetrieved'));
  } catch (error) {
    console.error('[GET_ALL_CASE_DETAILS_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_DETAILS_ERROR');
  }
};

const updateCase = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const success = await casesService.updateCase(req.params.id, req.body, updatedBy);
    if (!success) return res.fail(req.t('case.notFound'), 404, 'NOT_FOUND');
    return res.success(null, req.t('case.updated'));
  } catch (error) {
    console.error('[UPDATE_CASE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    return res.fail(req.t('case.failedUpdate'), 500, 'CASE_UPDATE_ERROR');
  }
};

const deleteCase = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const deletedByName = req.user ? (req.user.employeeName || req.user.username || 'User') : 'User';
    const success = await casesService.deleteCaseWithNotification(req.params.id, deletedBy, deletedByName);
    if (!success) return res.fail(req.t('case.notFound'), 404, 'NOT_FOUND');
    return res.success(null, req.t('case.deleted'));
  } catch (error) {
    console.error('[DELETE_CASE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    
    if (isConstraintError(error)) {
      return res.fail(getConstraintErrorMessage(req), 400, 'CASE_HAS_RECORDS');
    }

    return res.fail(req.t('case.failedDelete'), 500, 'CASE_DELETE_ERROR');
  }
};

const getCasesByBranch = async (req, res) => {
  try {
    const data = await casesService.getCasesByBranch(req.params.branchId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASES_BY_BRANCH_ERROR]', { branchId: req.params.branchId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASES_BRANCH_ERROR');
  }
};

const getCasesByLawyer = async (req, res) => {
  try {
    const data = await casesService.getCasesByLawyer(req.params.lawyerId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASES_BY_LAWYER_ERROR]', { lawyerId: req.params.lawyerId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASES_LAWYER_ERROR');
  }
};

const getCasesByLegalAdvisor = async (req, res) => {
  try {
    const data = await casesService.getCasesByLegalAdvisor(req.params.legalAdvisorId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASES_BY_ADVISOR_ERROR]', { legalAdvisorId: req.params.legalAdvisorId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASES_ADVISOR_ERROR');
  }
};

const getCasesByLegalResearcher = async (req, res) => {
  try {
    const data = await casesService.getCasesByLegalResearcher(req.params.legalResearcherId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASES_BY_RESEARCHER_ERROR]', { legalResearcherId: req.params.legalResearcherId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASES_RESEARCHER_ERROR');
  }
};

const addPartyToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const { party_id, type } = req.body;
    if (!party_id || !type) return res.fail(req.t('generic.validationError'), 400, 'VALIDATION_ERROR');
    const result = await casesService.addCaseParty(caseId, req.body);
    return res.created(result || null, req.t('case.partyAdded'));
  } catch (error) {
    console.error('[ADD_PARTY_TO_CASE_ERROR]', { caseId: req.params.caseId, message: error.message, stack: error.stack, body: req.body });
    return res.fail(req.t('case.failedUpdate'), 500, 'CASE_PARTY_ADD_ERROR');
  }
};

const deletePartyFromCase = async (req, res) => {
  try {
    const { caseId, partyId } = req.params;
    const result = await casesService.deleteCaseParty(caseId, partyId);
    return res.success(result || null, req.t('case.partyRemoved'));
  } catch (error) {
    console.error('[DELETE_PARTY_FROM_CASE_ERROR]', { caseId: req.params.caseId, partyId: req.params.partyId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedUpdate'), 500, 'CASE_PARTY_DELETE_ERROR');
  }
};

const searchCasesForAddNewCasePage = async (req, res) => {
  try {
    const data = await casesService.searchCasesForAddNewCasePage(req.query.q || '');
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    console.error('[SEARCH_CASES_ERROR]', { query: req.query, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_SEARCH_ERROR');
  }
};

const getCaseParties = async (req, res) => {
  try {
    const data = await casesService.getCaseParties(req.params.caseId);
    return res.success(data, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASE_PARTIES_ERROR]', { caseId: req.params.caseId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_PARTIES_ERROR');
  }
};

const getCaseSessions = async (req, res) => {
  try {
    const { caseId } = req.params;
    if (!caseId) return res.fail('Case ID is required', 400, 'VALIDATION_ERROR');
    const sessions = await sessionsService.getSessionsByCase(caseId);
    return res.success(sessions, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASE_SESSIONS_ERROR]', { caseId: req.params.caseId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_SESSIONS_ERROR');
  }
};

const getEmployeesCaseDocuments = async (req, res) => {
  try {
    const docs = await casesService.getEmployeesCaseDocuments(req.params.id);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_EMP_CASE_DOCS_ERROR]', { caseId: req.params.id, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_EMP_DOCS_ERROR');
  }
};

const deleteEmployeeCaseDocument = async (req, res) => {
  try {
    const success = await casesService.deleteEmployeeCaseDocument(req.params.id, req.params.documentId);
    if (!success) return res.fail(req.t('generic.notFound'), 404, 'NOT_FOUND');
    return res.success(null, req.t('case.docDeleted'));
  } catch (error) {
    console.error('[DELETE_EMP_CASE_DOC_ERROR]', { caseId: req.params.id, documentId: req.params.documentId, message: error.message, stack: error.stack });
    return res.fail(req.t('generic.internalError'), 500, 'CASE_EMP_DOC_DELETE_ERROR');
  }
};

const getCaseDocuments = async (req, res) => {
  try {
    const docs = await casesService.getCaseDocuments(req.params.id);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASE_DOCS_ERROR]', { caseId: req.params.id, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_DOCS_ERROR');
  }
};

const deleteCaseDocument = async (req, res) => {
  try {
    const success = await casesService.deleteCaseDocument(req.params.id, req.params.documentId);
    if (!success) return res.fail(req.t('generic.notFound'), 404, 'NOT_FOUND');
    return res.success(null, req.t('case.docDeleted'));
  } catch (error) {
    console.error('[DELETE_CASE_DOC_ERROR]', { caseId: req.params.id, documentId: req.params.documentId, message: error.message, stack: error.stack });
    return res.fail(req.t('generic.internalError'), 500, 'CASE_DOC_DELETE_ERROR');
  }
};

const getCaseCourtDocuments = async (req, res) => {
  try {
    const docs = await casesService.getCaseCourtDocuments(req.params.id);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASE_COURT_DOCS_ERROR]', { caseId: req.params.id, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_COURT_DOCS_ERROR');
  }
};

const deleteCaseCourtDocument = async (req, res) => {
  try {
    const success = await casesService.deleteCaseCourtDocument(req.params.id, req.params.documentId);
    if (!success) return res.fail(req.t('generic.notFound'), 404, 'NOT_FOUND');
    return res.success(null, req.t('case.docDeleted'));
  } catch (error) {
    console.error('[DELETE_CASE_COURT_DOC_ERROR]', { caseId: req.params.id, documentId: req.params.documentId, message: error.message, stack: error.stack });
    return res.fail(req.t('generic.internalError'), 500, 'CASE_COURT_DOC_DELETE_ERROR');
  }
};

const getCasePartyDocuments = async (req, res) => {
  try {
    const docs = await casesService.getCasePartyDocuments(req.params.id, req.params.partyId);
    return res.success(docs, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASE_PARTY_DOCS_ERROR]', { caseId: req.params.id, partyId: req.params.partyId, message: error.message, stack: error.stack });
    return res.fail(req.t('case.failedFetch'), 500, 'CASE_PARTY_DOCS_ERROR');
  }
};

const addCasePartyDocument = async (req, res) => {
  try {
    const result = await casesService.addCasePartyDocument(req.params.id, req.params.partyId, req.body);
    return res.created(result || null, req.t('generic.created'));
  } catch (error) {
    console.error('[ADD_CASE_PARTY_DOC_ERROR]', { caseId: req.params.id, partyId: req.params.partyId, message: error.message, stack: error.stack, body: req.body });
    return res.fail(req.t('generic.internalError'), 500, 'CASE_PARTY_DOC_ADD_ERROR');
  }
};

const deleteCasePartyDocument = async (req, res) => {
  try {
    const success = await casesService.deleteCasePartyDocument(req.params.id, req.params.partyId, req.params.documentId);
    if (!success) return res.fail(req.t('generic.notFound'), 404, 'NOT_FOUND');
    return res.success(null, req.t('case.docDeleted'));
  } catch (error) {
    console.error('[DELETE_CASE_PARTY_DOC_ERROR]', { caseId: req.params.id, partyId: req.params.partyId, documentId: req.params.documentId, message: error.message, stack: error.stack });
    return res.fail(req.t('generic.internalError'), 500, 'CASE_PARTY_DOC_DELETE_ERROR');
  }
};

const updateCaseAdditionalNote = async (req, res) => {
  try {
    const { additional_note } = req.body;
    if (additional_note === undefined) return res.fail(req.t('generic.validationError'), 400, 'VALIDATION_ERROR');
    const updatedBy = req.user ? req.user.id : null;
    const success = await casesService.updateCaseAdditionalNote(req.params.id, additional_note, updatedBy);
    if (!success) return res.fail(req.t('case.notFound'), 404, 'NOT_FOUND');
    return res.success(null, req.t('case.noteUpdated'));
  } catch (error) {
    console.error('[UPDATE_CASE_NOTE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    return res.fail(req.t('case.failedUpdate'), 500, 'CASE_NOTE_UPDATE_ERROR');
  }
};

const createCaseWithRelations = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    const { caseData, parties, caseDegrees, petitions, sessions, executions, judicialNotices, tasks, memos } = req.body;
    if (!caseData) return res.fail(req.t('generic.validationError'), 400, 'VALIDATION_ERROR');

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

    return res.created({ caseId: result.caseId }, req.t('generic.created'));
  } catch (error) {
    console.error('[CREATE_CASE_BATCH_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    return res.fail(req.t('case.failedCreate'), 500, 'CASE_BATCH_CREATE_ERROR', { error: error.message });
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
