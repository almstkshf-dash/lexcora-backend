const employeeRequestsModel = require("../models/employeeRequestsModel");

// Get all employee requests or by employee_id
const getEmployeeRequests = async (req, res) => {
  try {
    const { 
      employee_id, 
      page = 1, 
      limit = 20,
      manager_approval,
      hr_approval,
      type,
      search
    } = req.query;
    
    const filters = {
      employeeId: employee_id || null,
      page: parseInt(page),
      limit: parseInt(limit),
      managerApproval: manager_approval || null,
      hrApproval: hr_approval || null,
      type: type || null,
      search: search || null
    };

    const result = await employeeRequestsModel.getAllEmployeeRequests(filters);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get employee request by ID
const getEmployeeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await employeeRequestsModel.getEmployeeRequestById(id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Employee request not found"
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get all requests for a specific employee
const getRequestsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const filters = {
      employeeId: employeeId,
      page: 1,
      limit: 1000, // Get all requests for the employee
    };

    const result = await employeeRequestsModel.getAllEmployeeRequests(filters);
    
    res.json({
      success: true,
      data: result.data
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new employee request
const createEmployeeRequest = async (req, res) => {
  try {
    const { employee_id, date, type, from_date, to_date } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, date, type"
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user.id;
    
    // Create employee request
    const requestData = {
      employee_id,
      date,
      type,
      from_date: from_date || null,
      to_date: to_date || null,
      created_by
    };
    
    const requestId = await employeeRequestsModel.createEmployeeRequest(requestData);
    
    // Fetch the created request with full details
    const newRequest = await employeeRequestsModel.getEmployeeRequestById(requestId);
    
    res.status(201).json({
      success: true,
      message: "Employee request created successfully",
      data: newRequest
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update employee request
const updateEmployeeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, from_date, to_date } = req.body;
    
    // Validate required fields
    if (!date || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: date, type"
      });
    }
    
    // Check if request exists
    const existingRequest = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Employee request not found"
      });
    }
    
    // Update employee request
    const requestData = {
      date,
      type,
      from_date: from_date || null,
      to_date: to_date || null
    };
    
    await employeeRequestsModel.updateEmployeeRequest(id, requestData);
    
    // Fetch the updated request
    const updatedRequest = await employeeRequestsModel.getEmployeeRequestById(id);
    
    res.json({
      success: true,
      message: "Employee request updated successfully",
      data: updatedRequest
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete employee request
const deleteEmployeeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if request exists
    const existingRequest = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Employee request not found"
      });
    }
    
    // Delete from database
    await employeeRequestsModel.deleteEmployeeRequest(id);
    
    res.json({
      success: true,
      message: "Employee request deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting employee request:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update manager approval status
const updateManagerApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_approval } = req.body;
    
    // Validate manager_approval value
    if (!manager_approval) {
      return res.status(400).json({
        success: false,
        message: "manager_approval field is required"
      });
    }
    
    // Validate that it's one of the allowed values
    const allowedStatuses = ['approved', 'rejected', 'pending'];
    if (!allowedStatuses.includes(manager_approval)) {
      return res.status(400).json({
        success: false,
        message: "manager_approval must be 'approved', 'rejected', or 'pending'"
      });
    }
    
    // Check if request exists
    const existingRequest = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Employee request not found"
      });
    }
    
    // Update manager approval
    await employeeRequestsModel.updateManagerApproval(id, manager_approval);
    
    // Fetch the updated request
    const updatedRequest = await employeeRequestsModel.getEmployeeRequestById(id);
    
    res.json({
      success: true,
      message: "Manager approval updated successfully",
      data: updatedRequest
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update HR approval status
const updateHrApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { hr_approval } = req.body;
    
    // Validate hr_approval value
    if (!hr_approval) {
      return res.status(400).json({
        success: false,
        message: "hr_approval field is required"
      });
    }
    
    // Validate that it's one of the allowed values
    const allowedStatuses = ['approved', 'rejected', 'pending'];
    if (!allowedStatuses.includes(hr_approval)) {
      return res.status(400).json({
        success: false,
        message: "hr_approval must be 'approved', 'rejected', or 'pending'"
      });
    }
    
    // Check if request exists
    const existingRequest = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Employee request not found"
      });
    }
    
    // Update HR approval
    await employeeRequestsModel.updateHrApproval(id, hr_approval);
    
    // Fetch the updated request
    const updatedRequest = await employeeRequestsModel.getEmployeeRequestById(id);
    
    res.json({
      success: true,
      message: "HR approval updated successfully",
      data: updatedRequest
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getEmployeeRequests,
  getEmployeeRequest,
  getRequestsByEmployeeId,
  createEmployeeRequest,
  updateEmployeeRequest,
  updateManagerApproval,
  updateHrApproval,
  deleteEmployeeRequest
};
