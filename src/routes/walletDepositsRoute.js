const express = require('express');
const router = express.Router();
const walletDepositsController = require('../controllers/walletDepositsController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { 
  idValidator,
  walletIdValidator,
  clientIdValidator,
  paginationValidator
} = require('../middlewares/validators');

// Get all wallet deposits
router.get('/', authenticateToken, paginationValidator, walletDepositsController.getAllWalletDeposits);

// Get wallet deposit by id
router.get('/:id', authenticateToken, idValidator, walletDepositsController.getWalletDepositById);

// Get deposits by wallet id
router.get('/wallet/:walletId', authenticateToken, walletIdValidator, walletDepositsController.getDepositsByWalletId);

// Get deposits by client id
router.get('/client/:clientId', authenticateToken, clientIdValidator, walletDepositsController.getDepositsByClientId);

// Create new wallet deposit
router.post('/', authenticateToken, walletDepositsController.createWalletDeposit);

// Update wallet deposit
router.put('/:id', authenticateToken, idValidator, walletDepositsController.updateWalletDeposit);

// Delete wallet deposit
router.delete('/:id', authenticateToken, idValidator, walletDepositsController.deleteWalletDeposit);

module.exports = router;
