const express = require('express');
const router = express.Router();
const {
  getAllLegalPeriods,
  getLegalPeriodById,
  createLegalPeriod,
  updateLegalPeriod,
  deleteLegalPeriod
} = require('../controllers/legalPeriodsController');

// Get all legal periods
router.get('/', getAllLegalPeriods);

// Get single legal period by ID
router.get('/:id', getLegalPeriodById);

// Create new legal period
router.post('/', createLegalPeriod);

// Update legal period
router.put('/:id', updateLegalPeriod);

// Delete legal period
router.delete('/:id', deleteLegalPeriod);

module.exports = router;
