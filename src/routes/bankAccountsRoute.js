const express = require('express');
const router = express.Router();
const bankAccountsController = require('../controllers/bankAccountsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { upload } = require('../controllers/uploadController');
const { 
  idValidator, 
  paginationValidator,
  bankAccountValidators 
} = require('../middlewares/validators');

// Get all bank accounts
// Now validates pagination parameters
router.get('/', authenticateToken, paginationValidator, bankAccountsController.getAllBankAccounts);

// Get bank account by id
// Now validates that id is a positive integer
router.get('/:id', authenticateToken, idValidator, bankAccountsController.getBankAccountById);

// Create new bank account
// Now validates all required fields (account_name, account_number, bank_name, initial_balance)
router.post('/', authenticateToken, bankAccountValidators.create, bankAccountsController.createBankAccount);

// Update bank account
// Now validates id parameter
router.put('/:id', authenticateToken, idValidator, bankAccountsController.updateBankAccount);

// Delete bank account
// Now validates id parameter
router.delete('/:id', authenticateToken, idValidator, bankAccountsController.deleteBankAccount);

// Update account balance
// Now validates id, amount (must be positive number), and operation (must be 'add' or 'subtract')
router.patch('/:id/balance', authenticateToken, bankAccountValidators.updateBalance, bankAccountsController.updateAccountBalance);

// Get all logs for a bank account
router.get('/:id/logs', authenticateToken, idValidator, bankAccountsController.getBankAccountLogs);

// Create new bank account log with attachments
router.post('/logs', authenticateToken, upload.array('attachments', 10), bankAccountsController.createBankAccountLog);

// Update bank account log
router.put('/logs/:id', authenticateToken, idValidator, upload.array('attachments', 10), bankAccountsController.updateBankAccountLog);

// Delete bank account log
router.delete('/logs/:id', authenticateToken, idValidator, bankAccountsController.deleteBankAccountLog);

module.exports = router;

