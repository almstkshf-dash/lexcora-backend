const accountsModel = require("../models/accountsModel");
const journalEntriesModel = require("../models/journalEntriesModel");
const currenciesModel = require("../models/currenciesModel");
const accountingService = require("../services/accountingService");
const reportService = require("../services/reportService");

// Accounts
const getAccounts = async (req, res) => {
  try {
    const result = await accountsModel.getAllAccounts(req.query);
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
    const result = await journalEntriesModel.getTrialBalance(req.query);
    res.json(result);
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
    const result = await reportService.getAgingAnalysis('AR');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getAgingPayables = async (req, res) => {
  try {
    const result = await reportService.getAgingAnalysis('AP');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

const getVendorLiabilities = async (req, res) => {
  try {
    const result = await reportService.getVendorLiabilities();
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('generic.internalError') });
  }
};

module.exports = {
  getAccounts,
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
  getVendorLiabilities
};
