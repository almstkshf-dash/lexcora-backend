// caseTypesRoute.js
// Routes for case types

const express = require('express');
const router = express.Router();
const caseTypesController = require('../controllers/caseTypesController');


// Get all case types
router.get('/', caseTypesController.getAllCaseTypes);

// Create a new case type
router.post('/', caseTypesController.createCaseType);

// Update a case type by ID
router.put('/:id', caseTypesController.updateCaseType);


// Delete a case type by ID
router.delete('/:id', caseTypesController.deleteCaseType);

module.exports = router;
