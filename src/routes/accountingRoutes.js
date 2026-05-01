const express = require("express");
const router = express.Router();
const accountingController = require("../controllers/accountingController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// All accounting routes require authentication
router.use(authenticateToken);

// Accounts
router.get("/accounts", accountingController.getAccounts);
router.get("/accounts/tree", accountingController.getAccountsTree);
router.post("/accounts", accountingController.createAccount);

// Fiscal Periods
router.get("/fiscal-periods", accountingController.getFiscalPeriods);
router.post("/fiscal-periods", accountingController.createFiscalPeriod);
router.patch("/fiscal-periods/:id/status", accountingController.updateFiscalPeriodStatus);

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
router.get("/reports/cash-flow", accountingController.getCashFlow);
router.get("/reports/aging-receivables", accountingController.getAgingReceivables);
router.get("/reports/aging-payables", accountingController.getAgingPayables);
router.get("/reports/vendor-liabilities", accountingController.getVendorLiabilities);
router.get("/reports/case-summary/:caseId", accountingController.getCaseSummary);
router.get("/reports/project-summary/:projectId", accountingController.getProjectSummary);
router.get("/reports/department-summary/:departmentId", accountingController.getDepartmentSummary);
router.get("/reports/budget-vs-actual", accountingController.getBudgetVsActual);

// Budgets
router.post("/budgets", accountingController.setBudget);

module.exports = router;
