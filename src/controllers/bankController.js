const bankService = require("../services/bankService");
const bankReconciliationModel = require("../models/bankReconciliationModel");
const cashManagementService = require("../services/cashManagementService");

const importStatement = async (req, res) => {
  try {
    const { bank_account_id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const importData = {
      bank_account_id,
      filename: file.originalname,
      file_url: file.location || file.path,
      created_by: req.user.id
    };

    const result = await bankService.importStatement(importData, file.buffer);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const autoMatch = async (req, res) => {
  try {
    const { bank_account_id } = req.params;
    const result = await bankService.autoMatch(bank_account_id, req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUnreconciledLines = async (req, res) => {
  try {
    const { bank_account_id } = req.params;
    const lines = await bankReconciliationModel.getUnreconciledLines(bank_account_id);
    res.json({ success: true, data: lines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reconcileLine = async (req, res) => {
  try {
    const result = await bankReconciliationModel.reconcileTransaction({
      ...req.body,
      reconciled_by: req.user.id
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCashFlowReport = async (req, res) => {
  try {
    const report = await cashManagementService.getCashFlow(req.query);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDailyCashFlow = async (req, res) => {
  try {
    const data = await cashManagementService.getDailyCashFlow(req.query.days || 30);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  importStatement,
  autoMatch,
  getUnreconciledLines,
  reconcileLine,
  getCashFlowReport,
  getDailyCashFlow
};
