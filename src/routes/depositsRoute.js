const express = require('express');
const router = express.Router();
const depositsController = require('../controllers/depositsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all deposits
router.get('/', authenticateToken, depositsController.getAllDeposits);

// Get deposit by id
router.get('/:id', authenticateToken, depositsController.getDepositById);

// Create new deposit
router.post('/', authenticateToken, depositsController.createDeposit);

// Update deposit
router.put('/:id', authenticateToken, depositsController.updateDeposit);

// Delete deposit
router.delete('/:id', authenticateToken, depositsController.deleteDeposit);

module.exports = router;
