// sessionsService.js
// Service functions for sessions

const sessionsModel = require('../models/sessionsModel');
const { deleteDocumentFiles } = require('./awsS3Service');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllSessions = async (filters = {}) => {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    
    // Build filter object
    const queryFilters = {
      branchId: filters.branchId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      fileNumber: filters.fileNumber,
      caseNumber: filters.caseNumber
    };
    
    // Get paginated sessions with total
    const { rows, total } = await sessionsModel.getAllSessions(queryFilters, limit, offset, filters.sortBy, filters.sortOrder);
    
    return {
      sessions: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error in getAllSessions:', error);
    throw new Error('Error fetching sessions');
  }
};

const getSessionById = async (id) => {
  try {
    return await sessionsModel.getSessionById(id);
  } catch (error) {
    console.error('Error in getSessionById:', error);
    throw new Error('Error fetching session');
  }
};

const createSession = async (session, createdBy = null) => {
  try {
    const sessionId = await sessionsModel.createSession(session);
    const files = session.files || [];
    for (const file of files) {
      await sessionsModel.addSessionDocument(sessionId, file.document_name, file.document_url);
    }
    
    // If has_ruling is true and legal_period_id is provided, insert into appeals_cassations
    if (session.has_ruling && session.legal_period_id) {
      await sessionsModel.addAppealCassation(sessionId, session.legal_period_id);
    }
    
    // Log session creation
    if (createdBy) {
      await logAdd(
        createdBy,
        'جلسة',
        session.title || session.session_number || 'جلسة جديدة',
        sessionId
      );
    }
    
    return sessionId;
  } catch (error) {
    console.error('Error in createSession:', error);
    throw new Error('Error creating session');
  }
};

const updateSession = async (id, session, updatedBy = null) => {
  try {
    const currentSession = await sessionsModel.getSessionById(id);
    const result = await sessionsModel.updateSession(id, session);
    const files = session.files || [];
    for (const file of files) {
      await sessionsModel.addSessionDocument(id, file.document_name, file.document_url);
    }
    
    // Handle appeals_cassations based on has_ruling
    if (session.has_ruling && session.legal_period_id) {
      // Check if appeals_cassation record exists
      const existingAppeal = await sessionsModel.getAppealCassationBySessionId(id);
      
      if (existingAppeal) {
        // Update existing record
        await sessionsModel.updateAppealCassation(id, session.legal_period_id);
      } else {
        // Create new record
        await sessionsModel.addAppealCassation(id, session.legal_period_id);
      }
    } else if (!session.has_ruling) {
      // If has_ruling is false, delete any existing appeals_cassation record
      await sessionsModel.deleteAppealCassationBySessionId(id);
    }
    
    // Log session update
    if (updatedBy && currentSession) {
      await logUpdate(
        updatedBy,
        'جلسة',
        currentSession.title || currentSession.session_number || 'جلسة',
        id
      );
    }
    
    return result;
  } catch (error) {
    console.error('Error in updateSession:', error);
    throw new Error('Error updating session');
  }
};

const deleteSession = async (id, deletedBy = null) => {
  try {
    // Get session details before deleting
    const session = await sessionsModel.getSessionById(id);
    
    // Get session documents before deleting to clean up files from AWS S3
    const documents = await sessionsModel.getSessionDocuments(id);
    
    // Delete the session from database (cascade will delete documents from DB)
    const result = await sessionsModel.deleteSession(id);
    
    // Delete files from AWS S3
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    // Log session deletion
    if (deletedBy && session) {
      await logDelete(
        deletedBy,
        'جلسة',
        session.title || session.session_number || 'جلسة',
        id
      );
    }
    
    return result;
  } catch (error) {
    throw new Error('Error deleting session');
  }
};

const getSessionsWithNoDecision = async () => {
  try {
    return await sessionsModel.getSessionsWithNoDecision();
  } catch (error) {
    console.error('Error in getSessionsWithNoDecision:', error);
    throw new Error('Error fetching sessions with no decision');
  }
};

const getSessionsWithDecision = async () => {
  try {
    return await sessionsModel.getSessionsWithDecision();
  } catch (error) {
    console.error('Error in getSessionsWithDecision:', error);
    throw new Error('Error fetching sessions with decision');
  }
};

const getSessionsInThisWeek = async () => {
  try {
    return await sessionsModel.getSessionsInThisWeek();
  } catch (error) {
    console.error('Error in getSessionsInThisWeek:', error);
    throw new Error('Error fetching sessions in this week');
  }
};

const getSessionDocuments = async (sessionId) => {
  try {
    return await sessionsModel.getSessionDocuments(sessionId);
  } catch (error) {
    console.error('Error in getSessionDocuments:', error);
    throw new Error('Error fetching session documents');
  }
};

const deleteSessionDocument = async (documentId, sessionId) => {
  try {
    // Get the document details before deleting to get the file URL
    const documents = await sessionsModel.getSessionDocuments(sessionId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    // Delete from database
    const result = await sessionsModel.deleteSessionDocument(documentId, sessionId);
    
    // Delete file from AWS S3
    if (documentToDelete && documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    return result;
  } catch (error) {
    console.error('Error in deleteSessionDocument:', error);
    throw new Error('Error deleting session document');
  }
};

const getSessionsByCase = async (caseId) => {
  try {
    return await sessionsModel.getSessionsByCase(caseId);
  } catch (error) {
    console.error('Error in getSessionsByCase:', error);
    throw new Error('Error fetching sessions for case');
  }
};

const getAppealsAndChallenges = async () => {
  try {
    return await sessionsModel.getAppealsAndChallenges();
  } catch (error) {
    console.error('Error in getAppealsAndChallenges:', error);
    throw new Error('Error fetching appeals and challenges');
  }
};

const getJudicialDecisions = async (filters = {}) => {
  try {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;
    
    // Build filter object
    const queryFilters = {
      branchId: filters.branchId,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      fileNumber: filters.fileNumber,
      caseNumber: filters.caseNumber
    };
    
    // Get total count for pagination
    const total = await sessionsModel.getJudicialDecisionsCount(queryFilters);
    
    // Get paginated judicial decisions
    const sessions = await sessionsModel.getJudicialDecisions(queryFilters, limit, offset);
    
    return {
      sessions,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('Error in getJudicialDecisions:', error);
    throw new Error('Error fetching judicial decisions');
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
  getSessionsByCase,
  getAppealsAndChallenges,
  getJudicialDecisions
};
