const express = require("express");
const router = express.Router();
const accountingController = require("../controllers/accountingController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// All accounting routes require authentication
router.use(authenticateToken);

// Accounts
router.get("/accounts", accountingController.getAccounts);
router.post("/accounts", accountingController.createAccount);

// Journal Entries
router.get("/journal-entries", accountingController.getJournalEntries);
router.get("/journal-entries/:id", accountingController.getJournalEntry);
router.post("/journal-entries", accountingController.createJournalEntry);

// Currencies
router.get("/currencies", accountingController.getCurrencies);

// Reports
router.get("/reports/trial-balance", accountingController.getTrialBalance);
router.get("/reports/profit-loss", accountingController.getProfitAndLoss);
router.get("/reports/balance-sheet", accountingController.getBalanceSheet);
router.get("/reports/aging-receivables", accountingController.getAgingReceivables);
router.get("/reports/aging-payables", accountingController.getAgingPayables);
router.get("/reports/vendor-liabilities", accountingController.getVendorLiabilities);

module.exports = router;
