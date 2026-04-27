const express = require('express');
const router = express.Router();
const pettyCashController = require('../controllers/pettyCashController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/funds', authenticateToken, pettyCashController.getFunds);
router.get('/funds/:id', authenticateToken, pettyCashController.getFundById);
router.post('/funds', authenticateToken, pettyCashController.createFund);

router.post('/transactions', authenticateToken, pettyCashController.createTransaction);
router.get('/funds/:id/transactions', authenticateToken, pettyCashController.getFundTransactions);

module.exports = router;
