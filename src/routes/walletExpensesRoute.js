const express = require('express');
const router = express.Router();
const walletExpensesController = require('../controllers/walletExpensesController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { upload } = require('../controllers/uploadController');
const { 
  idValidator,
  walletIdValidator
} = require('../middlewares/validators');

// Get all expenses with pagination
router.get('/', authenticateToken, walletExpensesController.getAllExpenses);

// Get expenses by wallet id
router.get('/wallet/:walletId', authenticateToken, walletIdValidator, walletExpensesController.getExpensesByWalletId);

// Get single expense by id
router.get('/:id', authenticateToken, idValidator, walletExpensesController.getExpenseById);

// Get expense items
router.get('/:id/items', authenticateToken, idValidator, walletExpensesController.getExpenseItems);

// Create new wallet expense
router.post('/', authenticateToken, walletExpensesController.createWalletExpense);

// Update wallet expense
router.put('/:id', authenticateToken, idValidator, walletExpensesController.updateWalletExpense);

// Delete wallet expense
router.delete('/:id', authenticateToken, idValidator, walletExpensesController.deleteWalletExpense);

// Receipt management routes
router.post('/:id/receipts', authenticateToken, idValidator, upload.array('receipts', 10), walletExpensesController.uploadReceipts);
router.get('/:id/receipts', authenticateToken, idValidator, walletExpensesController.getExpenseReceipts);
router.delete('/:id/receipts/:receiptId', authenticateToken, idValidator, walletExpensesController.deleteReceipt);

// Verification routes
router.post('/:id/approve', authenticateToken, idValidator, walletExpensesController.approveExpense);
router.post('/:id/reject', authenticateToken, idValidator, walletExpensesController.rejectExpense);

module.exports = router;
