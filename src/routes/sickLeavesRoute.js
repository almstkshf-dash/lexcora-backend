const express = require('express');
const router = express.Router();
const sickLeavesController = require('../controllers/sickLeavesController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, sickLeavesController.getSickLeaves);
router.get('/:id', authenticateToken, sickLeavesController.getSickLeave);
router.post('/', authenticateToken, sickLeavesController.createSickLeave);
router.put('/:id', authenticateToken, sickLeavesController.updateSickLeave);
router.delete('/:id', authenticateToken, sickLeavesController.deleteSickLeave);

module.exports = router;
