// litigationDegreesRoute.js
// Routes for litigation degrees

const express = require('express');
const router = express.Router();
const litigationDegreesController = require('../controllers/litigationDegreesController');

// Get all litigation degrees
router.get('/', litigationDegreesController.getAllLitigationDegrees);

// Get litigation degree by ID
router.get('/:id', litigationDegreesController.getLitigationDegreeById);

// Get litigation degrees by year
router.get('/year/:year', litigationDegreesController.getLitigationDegreesByYear);

// Get litigation degrees by case number
router.get('/case-number/:caseNumber', litigationDegreesController.getLitigationDegreesByCaseNumber);

// Create a new litigation degree
router.post('/', litigationDegreesController.createLitigationDegree);

// Update a litigation degree by ID
router.put('/:id', litigationDegreesController.updateLitigationDegree);

// Delete a litigation degree by ID
router.delete('/:id', litigationDegreesController.deleteLitigationDegree);

module.exports = router;