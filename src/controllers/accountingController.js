const accountsModel = require("../models/accountsModel");
const journalEntriesModel = require("../models/journalEntriesModel");
const currenciesModel = require("../models/currenciesModel");
const accountingService = require("../services/accountingService");
const fiscalPeriodsModel = require("../models/fiscalPeriodsModel");
const budgetsModel = require("../models/budgetsModel");
const assetsModel = require("../models/assetsModel");

// Accounts
const getAccounts = async (req, res) => {
  try {
    const result = await accountsModel.getAllAccounts(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_ACCOUNTS_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchAccounts'), 500, 'GET_ACCOUNTS_FAILED');
  }
};

const getAccountsTree = async (req, res) => {
  try {
    const result = await accountsModel.getAccountsTree(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_ACCOUNTS_TREE_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchAccounts'), 500, 'GET_ACCOUNTS_TREE_FAILED');
  }
};

const createAccount = async (req, res) => {
  try {
    const result = await accountsModel.createAccount(req.body);
    res.created(result, req.t('accounting.accountCreated'));
  } catch (error) {
    console.error('[CREATE_ACCOUNT_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('accounting.failedCreateAccount'), 500, 'CREATE_ACCOUNT_FAILED');
  }
};

// Fiscal Periods
const getFiscalPeriods = async (req, res) => {
  try {
    const result = await fiscalPeriodsModel.getAllPeriods(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_FISCAL_PERIODS_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchFiscalPeriods'), 500, 'GET_FISCAL_PERIODS_FAILED');
  }
};

const createFiscalPeriod = async (req, res) => {
  try {
    req.body.created_by = req.user ? req.user.id : null;
    const result = await fiscalPeriodsModel.createPeriod(req.body);
    res.created(result, req.t('accounting.fiscalPeriodCreated'));
  } catch (error) {
    console.error('[CREATE_FISCAL_PERIOD_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('accounting.failedCreateFiscalPeriod'), 500, 'CREATE_FISCAL_PERIOD_FAILED');
  }
};

const updateFiscalPeriodStatus = async (req, res) => {
  try {
    const result = await fiscalPeriodsModel.updatePeriodStatus(req.params.id, req.body.status);
    res.success(result, req.t('accounting.fiscalPeriodUpdated'));
  } catch (error) {
    console.error('[UPDATE_FISCAL_PERIOD_ERROR]', { message: error.message, stack: error.stack, params: req.params, body: req.body });
    res.fail(req.t('accounting.failedUpdateFiscalPeriod'), 500, 'UPDATE_FISCAL_PERIOD_FAILED');
  }
};

// Journal Entries
const getJournalEntries = async (req, res) => {
  try {
    const result = await journalEntriesModel.getAllJournalEntries(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_JOURNAL_ENTRIES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchJournalEntries'), 500, 'GET_JOURNAL_ENTRIES_FAILED');
  }
};

const getJournalEntry = async (req, res) => {
  try {
    const result = await journalEntriesModel.getJournalEntryById(req.params.id);
    res.success(result);
  } catch (error) {
    console.error('[GET_JOURNAL_ENTRY_ERROR]', { message: error.message, stack: error.stack, params: req.params });
    res.fail(req.t('accounting.failedFetchJournalEntries'), 500, 'GET_JOURNAL_ENTRY_FAILED');
  }
};

const createJournalEntry = async (req, res) => {
  try {
    const { entryData, items } = req.body;
    // Add creator id from auth middleware
    entryData.created_by = req.user ? req.user.id : (entryData.created_by || null);
    const result = await accountingService.createManualJournalEntry(entryData, items);
    res.created(result, req.t('accounting.journalEntryCreated'));
  } catch (error) {
    console.error('[CREATE_JOURNAL_ENTRY_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(error.message, 400, 'CREATE_JOURNAL_ENTRY_FAILED');
  }
};

// Currencies
const getCurrencies = async (req, res) => {
  try {
    const result = await currenciesModel.getAllCurrencies();
    res.success(result);
  } catch (error) {
    console.error('[GET_CURRENCIES_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('generic.internalError'), 500, 'GET_CURRENCIES_FAILED');
  }
};

// Reports
const getTrialBalance = async (req, res) => {
  try {
    const result = await accountingService.getTrialBalance(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_TRIAL_BALANCE_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_TRIAL_BALANCE_FAILED');
  }
};

const getCashFlow = async (req, res) => {
  try {
    const result = await accountingService.getCashFlow(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_CASH_FLOW_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_CASH_FLOW_FAILED');
  }
};

const getProfitAndLoss = async (req, res) => {
  try {
    const result = await accountingService.getProfitAndLoss(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_P_AND_L_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_P_AND_L_FAILED');
  }
};

const getBalanceSheet = async (req, res) => {
  try {
    const result = await accountingService.getBalanceSheet(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_BALANCE_SHEET_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_BALANCE_SHEET_FAILED');
  }
};

const getAgingReceivables = async (req, res) => {
  try {
    const result = await accountingService.getAgedReceivables(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_AGING_RECEIVABLES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_AGING_RECEIVABLES_FAILED');
  }
};

const getAgingPayables = async (req, res) => {
  try {
    const result = await accountingService.getAgedPayables(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_AGING_PAYABLES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_AGING_PAYABLES_FAILED');
  }
};

const getVendorLiabilities = async (req, res) => {
  try {
    const result = await accountingService.getAgedPayables(req.query); // Note: Service currently uses getAgedPayables for this too
    res.success(result);
  } catch (error) {
    console.error('[GET_VENDOR_LIABILITIES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_VENDOR_LIABILITIES_FAILED');
  }
};

const getCaseSummary = async (req, res) => {
  try {
    const result = await accountingService.getCaseFinancialSummary(req.params.caseId);
    res.success(result);
  } catch (error) {
    console.error('[GET_CASE_SUMMARY_ERROR]', { message: error.message, stack: error.stack, params: req.params });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_CASE_SUMMARY_FAILED');
  }
};

const getProjectSummary = async (req, res) => {
  try {
    const result = await accountingService.getProjectFinancialSummary(req.params.projectId);
    res.success(result);
  } catch (error) {
    console.error('[GET_PROJECT_SUMMARY_ERROR]', { message: error.message, stack: error.stack, params: req.params });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_PROJECT_SUMMARY_FAILED');
  }
};

const getDepartmentSummary = async (req, res) => {
  try {
    const result = await accountingService.getDepartmentFinancialSummary(req.params.departmentId);
    res.success(result);
  } catch (error) {
    console.error('[GET_DEPARTMENT_SUMMARY_ERROR]', { message: error.message, stack: error.stack, params: req.params });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_DEPARTMENT_SUMMARY_FAILED');
  }
};

const getAssetsReport = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const result = await assetsModel.getAllAssets(branch_id || null);
    res.success(result);
  } catch (error) {
    console.error('[GET_ASSETS_REPORT_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_ASSETS_REPORT_FAILED');
  }
};

const getVatReturn = async (req, res) => {
  try {
    const result = await accountingService.getVatReturn(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_VAT_RETURN_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchReports'), 500, 'GET_VAT_RETURN_FAILED');
  }
};

// Budgets
const setBudget = async (req, res) => {
  try {
    req.body.created_by = req.user ? req.user.id : null;
    const result = await budgetsModel.setBudget(req.body);
    res.success(result, req.t('accounting.budgetSet'));
  } catch (error) {
    console.error('[SET_BUDGET_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('accounting.failedSetBudget'), 500, 'SET_BUDGET_FAILED');
  }
};

const getBudgetVsActual = async (req, res) => {
  try {
    const result = await accountingService.getBudgetVsActual(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_BUDGET_VS_ACTUAL_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchBudgets'), 500, 'GET_BUDGET_VS_ACTUAL_FAILED');
  }
};

const getBudgets = async (req, res) => {
  try {
    const result = await budgetsModel.getAllBudgets(req.query);
    res.success(result);
  } catch (error) {
    console.error('[GET_BUDGETS_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('accounting.failedFetchBudgets'), 500, 'GET_BUDGETS_FAILED');
  }
};

const triggerDepreciationJob = async (req, res) => {
  try {
    const { enqueueJob } = require('../jobs/jobQueue');
    const user_id = req.user ? req.user.id : null;
    
    const job = await enqueueJob('run-depreciation', { user_id });
    
    res.success({ job_id: job.id }, req.t('accounting.depreciationQueued'));
  } catch (error) {
    console.error('[TRIGGER_DEPRECIATION_JOB_ERROR]', { message: error.message, stack: error.stack });
    res.fail(error.message, 500, 'TRIGGER_DEPRECIATION_FAILED');
  }
};

module.exports = {
  getAccounts,
  getAccountsTree,
  createAccount,
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  getCurrencies,
  getTrialBalance,
  getProfitAndLoss,
  getBalanceSheet,
  getAgingReceivables,
  getAgingPayables,
  getVendorLiabilities,
  getCaseSummary,
  getProjectSummary,
  getDepartmentSummary,
  getAssetsReport,
  getCashFlow,
  getFiscalPeriods,
  createFiscalPeriod,
  updateFiscalPeriodStatus,
  setBudget,
  getBudgetVsActual,
  getBudgets,
  triggerDepreciationJob,
  getVatReturn
};
