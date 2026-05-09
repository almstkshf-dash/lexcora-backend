const annualLeavesModel = require("../models/annualLeavesModel");
const { normalizePagination } = require("../utils/pagination");

// Get all annual leaves or by employee_id
const getAnnualLeaves = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['created_at', 'id', 'date']);
    const result = await annualLeavesModel.getAllAnnualLeaves(employee_id || null, { page, limit, sortBy, sortOrder });
    
    res.list(result.rows || result.data || result || [], req.t('generic.ok'), result.pagination || undefined);
  } catch (err) {
    console.error('[GET_ANNUAL_LEAVES_ERROR]', { message: err.message, stack: err.stack, query: req.query });
    res.fail(err.message, 500, 'ANNUAL_LEAVES_LIST_ERROR');
  }
};

// Get annual leave by ID
const getAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const annualLeave = await annualLeavesModel.getAnnualLeaveById(id);
    
    if (!annualLeave) {
      return res.fail(req.t('leave.notFound'), 404, 'ANNUAL_LEAVE_NOT_FOUND');
    }
    
    res.success(annualLeave);
  } catch (err) {
    console.error('[GET_ANNUAL_LEAVE_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(err.message, 500, 'ANNUAL_LEAVE_FETCH_ERROR');
  }
};

// Create new annual leave
const createAnnualLeave = async (req, res) => {
  try {
    const { employee_id, date, from_date, to_date, total_days, remaining_days, leave_type } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !from_date || !to_date || !total_days || remaining_days === undefined || !leave_type) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    // Validate leave_type
    if (!['paid', 'unpaid'].includes(leave_type)) {
      return res.fail(req.t('leave.invalidType'), 400, 'INVALID_LEAVE_TYPE');
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || null;
    
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
    
    res.created(newAnnualLeave, req.t('leave.created'));
  } catch (err) {
    console.error('[CREATE_ANNUAL_LEAVE_ERROR]', { message: err.message, stack: err.stack, body: req.body });
    res.fail(err.message, 500, 'ANNUAL_LEAVE_CREATE_ERROR');
  }
};

// Update annual leave
const updateAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, from_date, to_date, total_days, remaining_days, leave_type } = req.body;
    
    // Validate required fields
    if (!date || !from_date || !to_date || !total_days || remaining_days === undefined || !leave_type) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    // Validate leave_type
    if (!['paid', 'unpaid'].includes(leave_type)) {
      return res.fail(req.t('leave.invalidType'), 400, 'INVALID_LEAVE_TYPE');
    }
    
    // Check if annual leave exists
    const existingAnnualLeave = await annualLeavesModel.getAnnualLeaveById(id);
    if (!existingAnnualLeave) {
      return res.fail(req.t('leave.notFound'), 404, 'ANNUAL_LEAVE_NOT_FOUND');
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
    
    res.success(updatedAnnualLeave, req.t('leave.updated'));
  } catch (err) {
    console.error('[UPDATE_ANNUAL_LEAVE_ERROR]', { id: req.params.id, message: err.message, stack: err.stack, body: req.body });
    res.fail(err.message, 500, 'ANNUAL_LEAVE_UPDATE_ERROR');
  }
};

// Delete annual leave
const deleteAnnualLeave = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if annual leave exists
    const existingAnnualLeave = await annualLeavesModel.getAnnualLeaveById(id);
    if (!existingAnnualLeave) {
      return res.fail(req.t('leave.notFound'), 404, 'ANNUAL_LEAVE_NOT_FOUND');
    }
    
    await annualLeavesModel.deleteAnnualLeave(id);
    
    res.success(null, req.t('leave.deleted'));
  } catch (err) {
    console.error('[DELETE_ANNUAL_LEAVE_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(err.message, 500, 'ANNUAL_LEAVE_DELETE_ERROR');
  }
};

module.exports = {
  getAnnualLeaves,
  getAnnualLeave,
  createAnnualLeave,
  updateAnnualLeave,
  deleteAnnualLeave
};
