const express = require('express');
const router = express.Router();
const caseDegreesController = require('../controllers/caseDegreesController');

// GET /api/case-degrees - Get all case degrees
router.get('/', caseDegreesController.getAllCaseDegrees);

// GET /api/case-degrees/search - Search case degrees
router.get('/search', caseDegreesController.searchCaseDegrees);

// GET /api/case-degrees/case/:caseId - Get case degrees by case ID
router.get('/case/:caseId', caseDegreesController.getCaseDegreesByCaseId);

// GET /api/case-degrees/:id - Get case degree by ID
router.get('/:id', caseDegreesController.getCaseDegreeById);

// POST /api/case-degrees - Create new case degree
router.post('/', caseDegreesController.createCaseDegree);

// PUT /api/case-degrees/:id - Update case degree
router.put('/:id', caseDegreesController.updateCaseDegree);

// DELETE /api/case-degrees/:id - Delete case degree
router.delete('/:id', caseDegreesController.deleteCaseDegree);

module.exports = router;