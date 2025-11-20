const otherLeavesModel = require("../models/otherLeavesModel");
const { normalizePagination } = require("../utils/pagination");

// Get all other leaves or by employee_id
const getOtherLeaves = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['created_at', 'id']);
    const result = await otherLeavesModel.getAllOtherLeaves(employee_id || null, { page, limit, sortBy, sortOrder });
    
    res.success(result.rows || result.data || result, req.t('generic.ok'), 200, result.pagination || undefined);
  } catch (err) {
    res.fail(err.message, 500, 'OTHER_LEAVES_LIST_ERROR');
  }
};

// Get other leave by ID
const getOtherLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const otherLeave = await otherLeavesModel.getOtherLeaveById(id);
    
    if (!otherLeave) {
      return res.status(404).json({
        success: false,
        message: "Other leave not found"
      });
    }
    
    res.json({
      success: true,
      data: otherLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new other leave
const createOtherLeave = async (req, res) => {
  try {
    const { employee_id, date, from_date, to_date, total_days, remaining_days, leave_reason, leave_type } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !from_date || !to_date || !total_days || remaining_days === undefined || !leave_reason || !leave_type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, date, from_date, to_date, total_days, remaining_days, leave_reason, leave_type"
      });
    }
    
    // Validate leave_reason
    // if (!['maternity', 'paternity', 'study', 'emergency'].includes(leave_reason)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid leave_reason. Must be 'maternity', 'paternity', 'study', or 'emergency'"
    //   });
    // }
    
    // Validate leave_type
    if (!['paid', 'unpaid'].includes(leave_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave_type. Must be 'paid' or 'unpaid'"
      });
    }
    
    // Get created_by from authenticated user (from auth middleware)
    const created_by = req.user.id;
    
    const otherLeaveData = {
      employee_id,
      date,
      from_date,
      to_date,
      total_days,
      remaining_days,
      leave_reason,
      leave_type,
      created_by
    };
    
    const otherLeaveId = await otherLeavesModel.createOtherLeave(otherLeaveData);
    
    // Fetch the created other leave with full details
    const newOtherLeave = await otherLeavesModel.getOtherLeaveById(otherLeaveId);
    
    res.status(201).json({
      success: true,
      message: "Other leave created successfully",
      data: newOtherLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update other leave
const updateOtherLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, from_date, to_date, total_days, remaining_days, leave_reason, leave_type } = req.body;
    
    // Validate required fields
    if (!date || !from_date || !to_date || !total_days || remaining_days === undefined || !leave_reason || !leave_type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: date, from_date, to_date, total_days, remaining_days, leave_reason, leave_type"
      });
    }
    
    // Validate leave_reason
    // if (!['maternity', 'paternity', 'study', 'emergency'].includes(leave_reason)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid leave_reason. Must be 'maternity', 'paternity', 'study', or 'emergency'"
    //   });
    // }
    
    // Validate leave_type
    if (!['paid', 'unpaid'].includes(leave_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave_type. Must be 'paid' or 'unpaid'"
      });
    }
    
    // Check if other leave exists
    const existingOtherLeave = await otherLeavesModel.getOtherLeaveById(id);
    if (!existingOtherLeave) {
      return res.status(404).json({
        success: false,
        message: "Other leave not found"
      });
    }
    
    const otherLeaveData = {
      date,
      from_date,
      to_date,
      total_days,
      remaining_days,
      leave_reason,
      leave_type
    };
    
    await otherLeavesModel.updateOtherLeave(id, otherLeaveData);
    
    // Fetch the updated other leave
    const updatedOtherLeave = await otherLeavesModel.getOtherLeaveById(id);
    
    res.json({
      success: true,
      message: "Other leave updated successfully",
      data: updatedOtherLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete other leave
const deleteOtherLeave = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if other leave exists
    const existingOtherLeave = await otherLeavesModel.getOtherLeaveById(id);
    if (!existingOtherLeave) {
      return res.status(404).json({
        success: false,
        message: "Other leave not found"
      });
    }
    
    await otherLeavesModel.deleteOtherLeave(id);
    
    res.json({
      success: true,
      message: "Other leave deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getOtherLeaves,
  getOtherLeave,
  createOtherLeave,
  updateOtherLeave,
  deleteOtherLeave
};
