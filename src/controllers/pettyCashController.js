const pettyCashModel = require("../models/pettyCashModel");

const getFunds = async (req, res) => {
  try {
    const funds = await pettyCashModel.getAllFunds(req.query.branch_id);
    res.json({ success: true, data: funds });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('finance.failedFetchFunds') });
  }
};

const getFundById = async (req, res) => {
  try {
    const fund = await pettyCashModel.getFundById(req.params.id);
    if (!fund) return res.status(404).json({ success: false, message: req.t('finance.fundNotFound') });
    res.json({ success: true, data: fund });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('finance.failedFetchFund') });
  }
};

const createFund = async (req, res) => {
  try {
    const id = await pettyCashModel.createFund({
      ...req.body,
      created_by: req.user.id
    });
    res.json({ success: true, id });
  } catch (error) {
    if (error.message === "Fund name is required") {
      return res.status(400).json({ success: false, message: req.t('finance.fundNameRequired') });
    }
    res.status(500).json({ success: false, message: req.t('finance.failedCreateFund') });
  }
};

const createTransaction = async (req, res) => {
  try {
    const result = await pettyCashModel.createTransaction({
      ...req.body,
      created_by: req.user.id
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('finance.failedCreatePettyCashTransaction') });
  }
};

const getFundTransactions = async (req, res) => {
  try {
    const transactions = await pettyCashModel.getFundTransactions(req.params.id, req.query);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('finance.failedFetchFundTransactions') });
  }
};

module.exports = {
  getFunds,
  getFundById,
  createFund,
  createTransaction,
  getFundTransactions
};
