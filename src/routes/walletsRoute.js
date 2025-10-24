const express = require('express');
const router = express.Router();
const walletsController = require('../controllers/walletsController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { 
  idValidator, 
  clientIdValidator,
  paginationValidator
} = require('../middlewares/validators');

// Get all wallets
router.get('/stats', authenticateToken, walletsController.getWalletStats);
router.get('/', authenticateToken, paginationValidator, walletsController.getAllWallets);

// Get wallet by id
router.get('/:id', authenticateToken, idValidator, walletsController.getWalletById);

// Get wallets by client id
router.get('/client/:clientId', authenticateToken, clientIdValidator, walletsController.getWalletsByClientId);

// Get account statement for a wallet (deposits and expenses)
router.get('/:id/statement', authenticateToken, idValidator, walletsController.getAccountStatement);

// Create new wallet
router.post('/', authenticateToken, walletsController.createWallet);

// Update wallet
router.put('/:id', authenticateToken, idValidator, walletsController.updateWallet);

// Delete wallet
router.delete('/:id', authenticateToken, idValidator, walletsController.deleteWallet);

// Update wallet balance
router.patch('/:id/balance', authenticateToken, idValidator, walletsController.updateWalletBalance);

module.exports = router;