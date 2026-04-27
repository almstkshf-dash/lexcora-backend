const billsModel = require("../models/billsModel");

const getAllBills = async (req, res) => {
  try {
    const filters = {
      vendor_id: req.query.vendor_id,
      status: req.query.status,
      branch_id: req.query.branch_id
    };
    const result = await billsModel.getAllBills(filters);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBillById = async (req, res) => {
  try {
    const result = await billsModel.getBillById(req.params.id);
    if (!result.success) return res.status(404).json(result);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBill = async (req, res) => {
  try {
    const { billData, items } = req.body;
    // Inject creator ID from authenticated user if available
    if (req.employee && req.employee.id) {
      billData.created_by = req.employee.id;
    }
    const result = await billsModel.createBill(billData, items);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBillStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await billsModel.updateBillStatus(req.params.id, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllBills,
  getBillById,
  createBill,
  updateBillStatus
};
