const express = require('express');
const router = express.Router();
const caseClassificationsController = require('../controllers/caseClassificationsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');


router.get('/', authenticateToken, caseClassificationsController.getAllCaseClassifications);

// Create a new case classification
router.post('/', authenticateToken, checkPermission('Add Case Classification'), caseClassificationsController.createCaseClassification);

// Update a case classification by ID
router.put('/:id', authenticateToken, caseClassificationsController.updateCaseClassification);

// Delete a case classification by ID
router.delete('/:id', authenticateToken, checkPermission('Delete Case Classification'), caseClassificationsController.deleteCaseClassification);

module.exports = router;

