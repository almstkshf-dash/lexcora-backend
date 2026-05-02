const accountsModel = require("../models/accountsModel");
const journalEntriesModel = require("../models/journalEntriesModel");
const currenciesModel = require("../models/currenciesModel");
const accountingService = require("../services/accountingService");
const reportService = require("../services/reportService");
const fiscalPeriodsModel = require("../models/fiscalPeriodsModel");
const budgetsModel = require("../models/budgetsModel");
const assetsModel = require("../models/assetsModel");

// Accounts
const getAccounts = async (req, res) => {
  try {
    const result = await accountsModel.getAllAccounts(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getAccountsTree = async (req, res) => {
  try {
    const result = await accountsModel.getAccountsTree(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const createAccount = async (req, res) => {
  try {
    const result = await accountsModel.createAccount(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

// Fiscal Periods
const getFiscalPeriods = async (req, res) => {
  try {
    const result = await fiscalPeriodsModel.getAllPeriods(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const createFiscalPeriod = async (req, res) => {
  try {
    req.body.created_by = req.user ? req.user.id : null;
    const result = await fiscalPeriodsModel.createPeriod(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const updateFiscalPeriodStatus = async (req, res) => {
  try {
    const result = await fiscalPeriodsModel.updatePeriodStatus(req.params.id, req.body.status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

// Journal Entries
const getJournalEntries = async (req, res) => {
  try {
    const result = await journalEntriesModel.getAllJournalEntries(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getJournalEntry = async (req, res) => {
  try {
    const result = await journalEntriesModel.getJournalEntryById(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const createJournalEntry = async (req, res) => {
  try {
    const { entryData, items } = req.body;
    // Add creator id from auth middleware
    entryData.created_by = req.user ? req.user.id : entryData.created_by;
    const result = await accountingService.createManualJournalEntry(entryData, items);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Currencies
const getCurrencies = async (req, res) => {
  try {
    const result = await currenciesModel.getAllCurrencies();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

// Reports
const getTrialBalance = async (req, res) => {
  try {
    const result = await accountingService.getTrialBalance(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getCashFlow = async (req, res) => {
  try {
    const result = await accountingService.getCashFlow(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getProfitAndLoss = async (req, res) => {
  try {
    const result = await accountingService.getProfitAndLoss(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getBalanceSheet = async (req, res) => {
  try {
    const result = await accountingService.getBalanceSheet(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getAgingReceivables = async (req, res) => {
  try {
    const result = await accountingService.getAgedReceivables(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getAgingPayables = async (req, res) => {
  try {
    const result = await accountingService.getAgedPayables(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getVendorLiabilities = async (req, res) => {
  try {
    const result = await accountingService.getAgedPayables(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getCaseSummary = async (req, res) => {
  try {
    const result = await accountingService.getCaseFinancialSummary(req.params.caseId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getProjectSummary = async (req, res) => {
  try {
    const result = await accountingService.getProjectFinancialSummary(req.params.projectId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getDepartmentSummary = async (req, res) => {
  try {
    const result = await accountingService.getDepartmentFinancialSummary(req.params.departmentId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getAssetsReport = async (req, res) => {
  try {
    const result = await assetsModel.getAllAssets(req.query);
    res.json({ success: true, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

// Budgets
const setBudget = async (req, res) => {
  try {
    req.body.created_by = req.user ? req.user.id : null;
    const result = await budgetsModel.setBudget(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getBudgetVsActual = async (req, res) => {
  try {
    const result = await accountingService.getBudgetVsActual(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const triggerDepreciationJob = async (req, res) => {
  try {
    const { enqueueJob } = require('../jobs/jobQueue');
    const user_id = req.user ? req.user.id : null;
    
    const job = await enqueueJob('run-depreciation', { user_id });
    
    res.json({ 
      success: true, 
      message: "Depreciation job queued successfully",
      job_id: job.id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
  triggerDepreciationJob
};
