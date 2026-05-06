// casePetitionsRoute.js
// Routes for case petitions

const express = require('express');
const router = express.Router();
const casePetitionsController = require('../controllers/casePetitionsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Get all case petitions
router.get('/', authenticateToken, casePetitionsController.getAllCasePetitions);

// Get case petition statistics
router.get('/statistics', authenticateToken, casePetitionsController.getCasePetitionStatistics);

// Get case petitions by decision (accepted/rejected)
router.get('/decision/:decision', authenticateToken, casePetitionsController.getCasePetitionsByDecision);

// Get case petitions by date range
// Usage: /case-petitions/date-range?startDate=2024-01-01&endDate=2024-12-31
router.get('/date-range', authenticateToken, casePetitionsController.getCasePetitionsByDateRange);

// Get case petitions by case ID
router.get('/case/:caseId', authenticateToken, casePetitionsController.getCasePetitionsByCaseId);

// Get case petition by ID
router.get('/:id', authenticateToken, casePetitionsController.getCasePetitionById);

// Create a new case petition
router.post('/', authenticateToken, casePetitionsController.addCasePetition);

// Update case petition by ID
router.put('/:id', authenticateToken, casePetitionsController.updateCasePetition);

// Delete case petition by ID
router.delete('/:id', authenticateToken, casePetitionsController.deleteCasePetition);

// Delete case petition document by document ID
router.delete('/documents/:documentId', authenticateToken, casePetitionsController.deleteCasePetitionDocument);

module.exports = router;
