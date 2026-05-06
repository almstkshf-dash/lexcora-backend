const express = require('express');
const router = express.Router();
const otherLeavesController = require('../controllers/otherLeavesController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, otherLeavesController.getOtherLeaves);
router.get('/:id', authenticateToken, otherLeavesController.getOtherLeave);
router.post('/', authenticateToken, otherLeavesController.createOtherLeave);
router.put('/:id', authenticateToken, otherLeavesController.updateOtherLeave);
router.delete('/:id', authenticateToken, otherLeavesController.deleteOtherLeave);

module.exports = router;

