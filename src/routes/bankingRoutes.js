const express = require('express');
const router = express.Router();
const bankController = require('../controllers/bankController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { upload } = require('../controllers/uploadController');

// Bank Statement Imports & Reconciliation
router.post('/import', authenticateToken, upload.single('statement'), bankController.importStatement);
router.post('/auto-match/:bank_account_id', authenticateToken, bankController.autoMatch);
router.get('/unreconciled/:bank_account_id', authenticateToken, bankController.getUnreconciledLines);
router.post('/reconcile', authenticateToken, bankController.reconcileLine);

// Cash Flow Reporting
router.get('/cash-flow', authenticateToken, bankController.getCashFlowReport);
router.get('/cash-flow/daily', authenticateToken, bankController.getDailyCashFlow);

module.exports = router;
