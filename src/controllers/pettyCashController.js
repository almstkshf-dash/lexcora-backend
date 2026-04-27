const pettyCashModel = require("../models/pettyCashModel");

const getFunds = async (req, res) => {
  try {
    const funds = await pettyCashModel.getAllFunds(req.query.branch_id);
    res.json({ success: true, data: funds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFundById = async (req, res) => {
  try {
    const fund = await pettyCashModel.getFundById(req.params.id);
    if (!fund) return res.status(404).json({ success: false, message: "Fund not found" });
    res.json({ success: true, data: fund });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFundTransactions = async (req, res) => {
  try {
    const transactions = await pettyCashModel.getFundTransactions(req.params.id, req.query);
    res.json({ success: true, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFunds,
  getFundById,
  createFund,
  createTransaction,
  getFundTransactions
};
