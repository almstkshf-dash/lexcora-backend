// sessionsRoute.js
// Routes for sessions

const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessionsController');
const { authenticateToken } = require('../middliewares/authMiddleware');


// Get all sessions
router.get('/', sessionsController.getAllSessions);

// Get sessions with no decision
router.get('/no-decision', sessionsController.getSessionsWithNoDecision);

// Get sessions with decision
router.get('/with-decision', sessionsController.getSessionsWithDecision);

// Get sessions in this week
router.get('/this-week', sessionsController.getSessionsInThisWeek);

// Get a specific session by ID
router.get('/:id', sessionsController.getSessionById);

// Get all documents for a specific session
router.get('/:id/documents', sessionsController.getSessionDocuments);

// Delete a specific document from a session
router.delete('/:id/documents/:documentId', authenticateToken, sessionsController.deleteSessionDocument);

// Create a new session
router.post('/', authenticateToken, sessionsController.createSession);

// Update a session by ID
router.put('/:id', authenticateToken, sessionsController.updateSession);

// Delete a session by ID
router.delete('/:id', authenticateToken, sessionsController.deleteSession);

module.exports = router;
