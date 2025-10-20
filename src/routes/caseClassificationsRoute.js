const express = require('express');
const router = express.Router();
const caseClassificationsController = require('../controllers/caseClassificationsController');


router.get('/', caseClassificationsController.getAllCaseClassifications);

// Create a new case classification
router.post('/', caseClassificationsController.createCaseClassification);

// Update a case classification by ID
router.put('/:id', caseClassificationsController.updateCaseClassification);

// Delete a case classification by ID
router.delete('/:id', caseClassificationsController.deleteCaseClassification);

module.exports = router;
