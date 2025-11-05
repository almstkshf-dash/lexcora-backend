const express = require('express');
const router = express.Router();
const employeeCashTransactionsController = require('../controllers/employeeCashTransactionsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get transaction statistics (must be before /:id route)
router.get('/statistics', authenticateToken, employeeCashTransactionsController.getTransactionStatistics);

// Get all transactions
router.get('/', authenticateToken, employeeCashTransactionsController.getAllTransactions);

// Get transaction by id
router.get('/:id', authenticateToken, employeeCashTransactionsController.getTransactionById);

// Create new transaction
router.post('/', authenticateToken, employeeCashTransactionsController.createTransaction);

// Update transaction
router.put('/:id', authenticateToken, employeeCashTransactionsController.updateTransaction);

// Delete transaction
router.delete('/:id', authenticateToken, employeeCashTransactionsController.deleteTransaction);

// Delete attachment
router.delete('/:transactionId/attachments/:attachmentId', authenticateToken, employeeCashTransactionsController.deleteAttachment);

module.exports = router;
