// sessionsRoute.js
// Routes for sessions

const express = require('express');
const router = express.Router();
const sessionsController = require('../controllers/sessionsController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');


// Get all sessions
router.get('/', authenticateToken, checkPermission('View Sessions'), sessionsController.getAllSessions);

// Get sessions with no decision
router.get('/no-decision', authenticateToken, sessionsController.getSessionsWithNoDecision);

// Get sessions with decision
router.get('/with-decision', authenticateToken, sessionsController.getSessionsWithDecision);

// Get appeals and challenges (استئنافات وطعون)
router.get('/appeals-challenges', authenticateToken, sessionsController.getAppealsAndChallenges);

// Get judicial decisions (الأحكام القضائية الصادرة)
router.get('/judicial-decisions', authenticateToken, sessionsController.getJudicialDecisions);

// Get sessions in this week
router.get('/this-week', authenticateToken, sessionsController.getSessionsInThisWeek);

// Get a specific session by ID
router.get('/:id', authenticateToken,  sessionsController.getSessionById);

// Get all documents for a specific session
router.get('/:id/documents', authenticateToken, sessionsController.getSessionDocuments);

// Delete a specific document from a session
router.delete('/:id/documents/:documentId', authenticateToken, sessionsController.deleteSessionDocument);

// Create a new session
router.post('/', authenticateToken, checkPermission('Add Session'), sessionsController.createSession);

// Update a session by ID
router.put('/:id', authenticateToken, checkPermission('Edit Session'), sessionsController.updateSession);

// Delete a session by ID
router.delete('/:id', authenticateToken, checkPermission('Delete Session'), sessionsController.deleteSession);

module.exports = router;
