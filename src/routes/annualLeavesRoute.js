const express = require('express');
const router = express.Router();
const annualLeavesController = require('../controllers/annualLeavesController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, annualLeavesController.getAnnualLeaves);
router.get('/:id', authenticateToken, annualLeavesController.getAnnualLeave);
router.post('/', authenticateToken, annualLeavesController.createAnnualLeave);
router.put('/:id', authenticateToken, annualLeavesController.updateAnnualLeave);
router.delete('/:id', authenticateToken, annualLeavesController.deleteAnnualLeave);

module.exports = router;
