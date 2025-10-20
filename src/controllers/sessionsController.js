
const sessionsService = require('../services/sessionsService');

const getAllSessions = async (req, res) => {
  try {
    const sessions = await sessionsService.getAllSessions();
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions' });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await sessionsService.getSessionById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch session' });
  }
};

const createSession = async (req, res) => {
  try {
    const createdBy = req.user?.id || null;
    const sessionId = await sessionsService.createSession(req.body, createdBy);
    res.status(201).json({ success: true, id: sessionId, message: 'Session created' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create session' });
  }
};

const updateSession = async (req, res) => {
  try {
    const updatedBy = req.user?.id || null;
    const success = await sessionsService.updateSession(req.params.id, req.body, updatedBy);
    if (success) {
      res.json({ message: 'Session updated' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update session' });
  }
};

const deleteSession = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await sessionsService.deleteSession(req.params.id, deletedBy);
    if (success) {
      res.json({ message: 'Session deleted' });
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

const getSessionsWithNoDecision = async (req, res) => {
  try {
    const sessions = await sessionsService.getSessionsWithNoDecision();
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions with no decision' });
  }
};

const getSessionsWithDecision = async (req, res) => {
  try {
    const sessions = await sessionsService.getSessionsWithDecision();
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions with decision' });
  }
};

const getSessionsInThisWeek = async (req, res) => {
  try {
    const sessions = await sessionsService.getSessionsInThisWeek();
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch sessions in this week' });
  }
};

const getSessionDocuments = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const documents = await sessionsService.getSessionDocuments(sessionId);
    res.json({ success: true, data: documents });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch session documents' });
  }
};

const deleteSessionDocument = async (req, res) => {
  try {
    const { id: sessionId, documentId } = req.params;
    const success = await sessionsService.deleteSessionDocument(documentId, sessionId);
    if (success) {
      res.json({ success: true, message: 'Session document deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Session document not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete session document' });
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
  deleteSessionDocument
};
