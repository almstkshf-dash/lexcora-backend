// caseTypesRoute.js
// Routes for case types

const express = require('express');
const router = express.Router();
const caseTypesController = require('../controllers/caseTypesController');
const { checkPermission } = require('../middlewares/permissionsMiddleware');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all case types
router.get('/', authenticateToken, caseTypesController.getAllCaseTypes);

// Create a new case type
router.post('/', authenticateToken, checkPermission('Add Case Type'), caseTypesController.createCaseType);

// Update a case type by ID
router.put('/:id', authenticateToken, caseTypesController.updateCaseType);


// Delete a case type by ID
router.delete('/:id', authenticateToken, checkPermission('Delete Case Type'), caseTypesController.deleteCaseType);

module.exports = router;
