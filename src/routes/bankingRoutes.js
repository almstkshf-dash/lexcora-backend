const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { upload } = require('../controllers/uploadController');
const {
  cashFlowQueryValidator,
  dailyCashFlowQueryValidator
} = require('../middlewares/validators');

// Bank Statement Imports & Reconciliation
router.post('/import', authenticateToken, upload.single('statement'), bankController.importStatement);
router.post('/auto-match/:bank_account_id', authenticateToken, bankController.autoMatch);
router.get('/unreconciled/:bank_account_id', authenticateToken, bankController.getUnreconciledLines);
router.post('/reconcile', authenticateToken, bankController.reconcileLine);
router.post('/sync/:bank_account_id', authenticateToken, bankController.syncAccount);

// Cash Flow Reporting
router.get('/cash-flow', authenticateToken, cashFlowQueryValidator, bankController.getCashFlowReport);
router.get('/cash-flow/daily', authenticateToken, dailyCashFlowQueryValidator, bankController.getDailyCashFlow);

module.exports = router;
