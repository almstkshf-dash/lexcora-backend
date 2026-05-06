const express = require("express");
const router = express.Router();
const accountingController = require("../controllers/accountingController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const { checkPermission } = require("../middlewares/permissionsMiddleware");

// All accounting routes require authentication
router.use(authenticateToken);

// Accounts
router.get("/accounts", checkPermission('view_accounts'), accountingController.getAccounts);
router.get("/accounts/tree", checkPermission('view_accounts'), accountingController.getAccountsTree);
router.post("/accounts", checkPermission('manage_accounts'), accountingController.createAccount);

// Fiscal Periods
router.get("/fiscal-periods", checkPermission('view_fiscal_periods'), accountingController.getFiscalPeriods);
router.post("/fiscal-periods", checkPermission('manage_fiscal_periods'), accountingController.createFiscalPeriod);
router.patch("/fiscal-periods/:id/status", checkPermission('manage_fiscal_periods'), accountingController.updateFiscalPeriodStatus);

// Journal Entries
router.get("/journal-entries", checkPermission('view_journal_entries'), accountingController.getJournalEntries);
router.get("/journal-entries/:id", checkPermission('view_journal_entry'), accountingController.getJournalEntry);
router.post("/journal-entries", checkPermission('create_journal_entry'), accountingController.createJournalEntry);

// Currencies
router.get("/currencies", accountingController.getCurrencies);

// Reports
router.get("/reports/trial-balance", checkPermission('view_financial_reports'), accountingController.getTrialBalance);
router.get("/reports/profit-loss", checkPermission('view_financial_reports'), accountingController.getProfitAndLoss);
router.get("/reports/balance-sheet", checkPermission('view_financial_reports'), accountingController.getBalanceSheet);
router.get("/reports/cash-flow", checkPermission('view_financial_reports'), accountingController.getCashFlow);
router.get("/reports/aging-receivables", checkPermission('view_financial_reports'), accountingController.getAgingReceivables);
router.get("/reports/aging-payables", checkPermission('view_financial_reports'), accountingController.getAgingPayables);
router.get("/reports/vendor-liabilities", checkPermission('view_financial_reports'), accountingController.getVendorLiabilities);
router.get("/reports/case-summary/:caseId", checkPermission('view_financial_reports'), accountingController.getCaseSummary);
router.get("/reports/project-summary/:projectId", checkPermission('view_financial_reports'), accountingController.getProjectSummary);
router.get("/reports/department-summary/:departmentId", checkPermission('view_financial_reports'), accountingController.getDepartmentSummary);
router.get("/reports/budget-vs-actual", checkPermission('view_financial_reports'), accountingController.getBudgetVsActual);
router.get("/reports/assets", checkPermission('view_financial_reports'), accountingController.getAssetsReport);
router.get("/reports/vat-return", checkPermission('view_vat_reports'), accountingController.getVatReturn);

// Budgets
router.get("/budgets", checkPermission('view_budgets'), accountingController.getBudgets);
router.post("/budgets", checkPermission('manage_budgets'), accountingController.setBudget);

// Depreciation Job Trigger
router.post("/assets/run-depreciation", checkPermission('manage_assets'), accountingController.triggerDepreciationJob);

module.exports = router;

