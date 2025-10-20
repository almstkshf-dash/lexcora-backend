const express = require('express');
const router = express.Router();
const deductionsController = require('../controllers/deductionsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, deductionsController.getDeductions);
router.get('/:id', authenticateToken, deductionsController.getDeduction);
router.post('/', authenticateToken, deductionsController.createDeduction);
router.put('/:id', authenticateToken, deductionsController.updateDeduction);
router.delete('/:id', authenticateToken, deductionsController.deleteDeduction);

module.exports = router;
