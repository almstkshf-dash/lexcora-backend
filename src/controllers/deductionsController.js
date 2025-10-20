const deductionsModel = require("../models/deductionsModel");

// Get all deductions or by employee_id
const getDeductions = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const deductions = await deductionsModel.getAllDeductions(employee_id || null);
    
    res.json({
      success: true,
      data: deductions,
      count: deductions.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get deduction by ID
const getDeduction = async (req, res) => {
  try {
    const { id } = req.params;
    const deduction = await deductionsModel.getDeductionById(id);
    
    if (!deduction) {
      return res.status(404).json({
        success: false,
        message: "Deduction not found"
      });
    }
    
    res.json({
      success: true,
      data: deduction
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new deduction
const createDeduction = async (req, res) => {
  try {
    const { employee_id, date, amount, reason } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, date, amount, reason"
      });
    }
    
    // Get created_by from authenticated user (from auth middleware)
    const created_by = req.user.id;
    
    const deductionData = {
      employee_id,
      date,
      amount,
      reason,
      created_by
    };
    
    const deductionId = await deductionsModel.createDeduction(deductionData);
    
    // Fetch the created deduction with full details
    const newDeduction = await deductionsModel.getDeductionById(deductionId);
    
    res.status(201).json({
      success: true,
      message: "Deduction created successfully",
      data: newDeduction
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update deduction
const updateDeduction = async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_id, date, amount, reason } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, date, amount, reason"
      });
    }
    
    // Check if deduction exists
    const existingDeduction = await deductionsModel.getDeductionById(id);
    if (!existingDeduction) {
      return res.status(404).json({
        success: false,
        message: "Deduction not found"
      });
    }
    
    const deductionData = {
      employee_id,
      date,
      amount,
      reason
    };
    
    await deductionsModel.updateDeduction(id, deductionData);
    
    // Fetch the updated deduction
    const updatedDeduction = await deductionsModel.getDeductionById(id);
    
    res.json({
      success: true,
      message: "Deduction updated successfully",
      data: updatedDeduction
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete deduction
const deleteDeduction = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if deduction exists
    const existingDeduction = await deductionsModel.getDeductionById(id);
    if (!existingDeduction) {
      return res.status(404).json({
        success: false,
        message: "Deduction not found"
      });
    }
    
    await deductionsModel.deleteDeduction(id);
    
    res.json({
      success: true,
      message: "Deduction deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getDeductions,
  getDeduction,
  createDeduction,
  updateDeduction,
  deleteDeduction
};
