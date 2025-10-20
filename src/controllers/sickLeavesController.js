const sickLeavesModel = require("../models/sickLeavesModel");

// Get all sick leaves or by employee_id
const getSickLeaves = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const sickLeaves = await sickLeavesModel.getAllSickLeaves(employee_id || null);
    
    res.json({
      success: true,
      data: sickLeaves,
      count: sickLeaves.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get sick leave by ID
const getSickLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const sickLeave = await sickLeavesModel.getSickLeaveById(id);
    
    if (!sickLeave) {
      return res.status(404).json({
        success: false,
        message: "Sick leave not found"
      });
    }
    
    res.json({
      success: true,
      data: sickLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new sick leave
const createSickLeave = async (req, res) => {
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
    
    const sickLeaveData = {
      employee_id,
      date,
      from_date,
      to_date,
      total_days,
      remaining_days,
      leave_type,
      created_by
    };
    
    const sickLeaveId = await sickLeavesModel.createSickLeave(sickLeaveData);
    
    // Fetch the created sick leave with full details
    const newSickLeave = await sickLeavesModel.getSickLeaveById(sickLeaveId);
    
    res.status(201).json({
      success: true,
      message: "Sick leave created successfully",
      data: newSickLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update sick leave
const updateSickLeave = async (req, res) => {
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
    
    // Check if sick leave exists
    const existingSickLeave = await sickLeavesModel.getSickLeaveById(id);
    if (!existingSickLeave) {
      return res.status(404).json({
        success: false,
        message: "Sick leave not found"
      });
    }
    
    const sickLeaveData = {
      date,
      from_date,
      to_date,
      total_days,
      remaining_days,
      leave_type
    };
    
    await sickLeavesModel.updateSickLeave(id, sickLeaveData);
    
    // Fetch the updated sick leave
    const updatedSickLeave = await sickLeavesModel.getSickLeaveById(id);
    
    res.json({
      success: true,
      message: "Sick leave updated successfully",
      data: updatedSickLeave
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete sick leave
const deleteSickLeave = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if sick leave exists
    const existingSickLeave = await sickLeavesModel.getSickLeaveById(id);
    if (!existingSickLeave) {
      return res.status(404).json({
        success: false,
        message: "Sick leave not found"
      });
    }
    
    await sickLeavesModel.deleteSickLeave(id);
    
    res.json({
      success: true,
      message: "Sick leave deleted successfully"
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getSickLeaves,
  getSickLeave,
  createSickLeave,
  updateSickLeave,
  deleteSickLeave
};
