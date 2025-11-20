const annualLeavesModel = require("../models/annualLeavesModel");
const { normalizePagination } = require("../utils/pagination");

// Get all annual leaves or by employee_id
const getAnnualLeaves = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['created_at', 'id', 'date']);
    const result = await annualLeavesModel.getAllAnnualLeaves(employee_id || null, { page, limit, sortBy, sortOrder });
    
    res.success(result.rows || result.data || result, req.t('generic.ok'), 200, result.pagination || undefined);
  } catch (err) {
    res.fail(err.message, 500, 'ANNUAL_LEAVES_LIST_ERROR');
  }
};

// Get annual leave by ID
const getAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const annualLeave = await annualLeavesModel.getAnnualLeaveById(id);
    
    if (!annualLeave) {
      return res.status(404).json({
        success: false,
        message: "Annual leave not found"
      });
    }
    
    res.json({
      success: true,
      data: annualLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new annual leave
const createAnnualLeave = async (req, res) => {
  try {
    const { employee_id, date, from_date, to_date, total_days, remaining_days, leave_type } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !from_date || !to_date || !total_days || remaining_days === undefined || !leave_type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, date, from_date, to_date, total_days, remaining_days, leave_type"
      });
    }
    
    // Validate leave_type
    if (!['paid', 'unpaid'].includes(leave_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave_type. Must be 'paid' or 'unpaid'"
      });
    }
    
    // Get created_by from authenticated user (from auth middleware)
    const created_by = req.user.id;
    
    const annualLeaveData = {
      employee_id,
      date,
      from_date,
      to_date,
      total_days,
      remaining_days,
      leave_type,
      created_by
    };
    
    const annualLeaveId = await annualLeavesModel.createAnnualLeave(annualLeaveData);
    
    // Fetch the created annual leave with full details
    const newAnnualLeave = await annualLeavesModel.getAnnualLeaveById(annualLeaveId);
    
    res.status(201).json({
      success: true,
      message: "Annual leave created successfully",
      data: newAnnualLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update annual leave
const updateAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, from_date, to_date, total_days, remaining_days, leave_type } = req.body;
    
    // Validate required fields
    if (!date || !from_date || !to_date || !total_days || remaining_days === undefined || !leave_type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: date, from_date, to_date, total_days, remaining_days, leave_type"
      });
    }
    
    // Validate leave_type
    if (!['paid', 'unpaid'].includes(leave_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave_type. Must be 'paid' or 'unpaid'"
      });
    }
    
    // Check if annual leave exists
    const existingAnnualLeave = await annualLeavesModel.getAnnualLeaveById(id);
    if (!existingAnnualLeave) {
      return res.status(404).json({
        success: false,
        message: "Annual leave not found"
      });
    }
    
    const annualLeaveData = {
      date,
      from_date,
      to_date,
      total_days,
      remaining_days,
      leave_type
    };
    
    await annualLeavesModel.updateAnnualLeave(id, annualLeaveData);
    
    // Fetch the updated annual leave
    const updatedAnnualLeave = await annualLeavesModel.getAnnualLeaveById(id);
    
    res.json({
      success: true,
      message: "Annual leave updated successfully",
      data: updatedAnnualLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete annual leave
const deleteAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if annual leave exists
    const existingAnnualLeave = await annualLeavesModel.getAnnualLeaveById(id);
    if (!existingAnnualLeave) {
      return res.status(404).json({
        success: false,
        message: "Annual leave not found"
      });
    }
    
    await annualLeavesModel.deleteAnnualLeave(id);
    
    res.json({
      success: true,
      message: "Annual leave deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getAnnualLeaves,
  getAnnualLeave,
  createAnnualLeave,
  updateAnnualLeave,
  deleteAnnualLeave
};
