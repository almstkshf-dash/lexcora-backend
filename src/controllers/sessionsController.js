const sessionsService = require('../services/sessionsService');
const { normalizePagination } = require('../utils/pagination');

const getAllSessions = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['session_date', 'created_at', 'id']);
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
    
    const result = await sessionsService.getAllSessions(filters);
    res.success(result.sessions, req.t('generic.ok'), 200, result.pagination);
  } catch (error) {
    console.error('[GET_ALL_SESSIONS_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('case.failedFetch'), 500, 'SESSIONS_LIST_ERROR');
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await sessionsService.getSessionById(req.params.id);
    if (!session) {
      return res.fail(req.t('session.notFound'), 404, 'SESSION_NOT_FOUND');
    }
    res.success(session);
  } catch (error) {
    console.error('[GET_SESSION_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('session.failedFetch'), 500, 'SESSION_GET_ERROR');
  }
};

const createSession = async (req, res) => {
  try {
    const createdBy = req.user?.id || null;
    const sessionId = await sessionsService.createSession(req.body, createdBy);
    res.created({ id: sessionId }, req.t('session.created'));
  } catch (error) {
    console.error('[CREATE_SESSION_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('session.failedCreate'), 500, 'SESSION_CREATE_ERROR');
  }
};

const updateSession = async (req, res) => {
  try {
    const updatedBy = req.user?.id || null;
    const success = await sessionsService.updateSession(req.params.id, req.body, updatedBy);
    if (success) {
      res.success(null, req.t('session.updated'));
    } else {
      res.fail(req.t('session.notFound'), 404, 'SESSION_NOT_FOUND');
    }
  } catch (error) {
    console.error('[UPDATE_SESSION_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('session.failedUpdate'), 500, 'SESSION_UPDATE_ERROR');
  }
};

const deleteSession = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await sessionsService.deleteSession(req.params.id, deletedBy);
    if (success) {
      res.success(null, req.t('session.deleted'));
    } else {
      res.fail(req.t('session.notFound'), 404, 'SESSION_NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_SESSION_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('session.failedDelete'), 500, 'SESSION_DELETE_ERROR');
  }
};

const getSessionsWithNoDecision = async (req, res) => {
  try {
    const sessions = await sessionsService.getSessionsWithNoDecision();
    res.success(sessions);
  } catch (error) {
    console.error('[GET_SESSIONS_NO_DECISION_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('session.failedFetch'), 500, 'SESSIONS_NO_DECISION_ERROR');
  }
};

const getSessionsWithDecision = async (req, res) => {
  try {
    const sessions = await sessionsService.getSessionsWithDecision();
    res.success(sessions);
  } catch (error) {
    console.error('[GET_SESSIONS_WITH_DECISION_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('session.failedFetch'), 500, 'SESSIONS_WITH_DECISION_ERROR');
  }
};

const getSessionsInThisWeek = async (req, res) => {
  try {
    const sessions = await sessionsService.getSessionsInThisWeek();
    res.success(sessions);
  } catch (error) {
    console.error('[GET_SESSIONS_THIS_WEEK_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('session.failedFetch'), 500, 'SESSIONS_WEEK_ERROR');
  }
};

const getSessionDocuments = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const documents = await sessionsService.getSessionDocuments(sessionId);
    res.success(documents);
  } catch (error) {
    console.error('[GET_SESSION_DOCS_ERROR]', { sessionId: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('session.failedFetchDocs'), 500, 'SESSION_DOCS_ERROR');
  }
};

const deleteSessionDocument = async (req, res) => {
  try {
    const { id: sessionId, documentId } = req.params;
    const success = await sessionsService.deleteSessionDocument(documentId, sessionId);
    if (success) {
      res.success(null, req.t('session.docDeleted'));
    } else {
      res.fail(req.t('session.docNotFound'), 404, 'SESSION_DOC_NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_SESSION_DOC_ERROR]', { sessionId: req.params.id, documentId: req.params.documentId, message: error.message, stack: error.stack });
    res.fail(req.t('session.failedDeleteDoc'), 500, 'SESSION_DOC_DELETE_ERROR');
  }
};

const getAppealsAndChallenges = async (req, res) => {
  try {
    const sessions = await sessionsService.getAppealsAndChallenges();
    res.success(sessions);
  } catch (error) {
    console.error('[GET_APPEALS_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('session.failedFetch'), 500, 'SESSIONS_APPEALS_ERROR');
  }
};

const getJudicialDecisions = async (req, res) => {
  try {
    const { page, limit, branchId, fromDate, toDate, fileNumber, caseNumber } = req.query;
    
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
      branchId,
      fromDate,
      toDate,
      fileNumber,
      caseNumber
    };
    
    const result = await sessionsService.getJudicialDecisions(filters);
    res.success(result.sessions, req.t('generic.ok'), 200, {
      total: result.total,
      totalPages: result.totalPages,
      currentPage: result.currentPage
    });
  } catch (error) {
    console.error('[GET_JUDICIAL_DECISIONS_ERROR]', { query: req.query, message: error.message, stack: error.stack });
    res.fail(req.t('session.failedFetch'), 500, 'SESSIONS_JUDICIAL_ERROR');
  }
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  getSessionsWithNoDecision,
  getSessionsWithDecision,
  getSessionsInThisWeek,
  getSessionDocuments,
  deleteSessionDocument,
  getAppealsAndChallenges,
  getJudicialDecisions
};
