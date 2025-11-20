const express = require('express');
const router = express.Router();
const employeeCashTransactionsController = require('../controllers/employeeCashTransactionsController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');
const { PERMISSIONS } = require('../config/permissions');

// Get transaction statistics (must be before /:id route)
router.get('/statistics', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.view), employeeCashTransactionsController.getTransactionStatistics);

// Get expenses by client ID (must be before /:id route)
router.get('/client/:clientId/expenses', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.view), employeeCashTransactionsController.getExpensesByClientId);

// Get all transactions
router.get('/', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.view), employeeCashTransactionsController.getAllTransactions);

// Get transaction by id
router.get('/:id', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.view), employeeCashTransactionsController.getTransactionById);

// Create new transaction
router.post('/', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.create), employeeCashTransactionsController.createTransaction);

// Update transaction
router.put('/:id', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.update), employeeCashTransactionsController.updateTransaction);

// Delete transaction
router.delete('/:id', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.delete), employeeCashTransactionsController.deleteTransaction);

// Delete attachment
router.delete('/:transactionId/attachments/:attachmentId', authenticateToken, checkPermission(PERMISSIONS.employeeCashTransactions.deleteAttachment), employeeCashTransactionsController.deleteAttachment);

module.exports = router;
