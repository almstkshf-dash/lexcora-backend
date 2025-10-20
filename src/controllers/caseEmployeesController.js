const caseEmployeesService = require("../services/caseEmployeesService");

const getAllCaseEmployees = async (req, res) => {
  try {
    const caseEmployees = await caseEmployeesService.getAllCaseEmployees();
    res.status(200).json({
      success: true,
      data: caseEmployees,
      message: "Case employees retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCaseEmployee = async (req, res) => {
  try {
    const caseEmployeeId = await caseEmployeesService.createCaseEmployee(req.body);
    res.status(201).json({
      success: true,
      data: { id: caseEmployeeId },
      message: "Case employee created successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateCaseEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const isUpdated = await caseEmployeesService.updateCaseEmployee(id, req.body);
    
    if (isUpdated) {
      res.status(200).json({
        success: true,
        message: "Case employee updated successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update case employee"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCaseEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await caseEmployeesService.deleteCaseEmployee(id);
    
    if (isDeleted) {
      res.status(200).json({
        success: true,
        message: "Case employee deleted successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete case employee"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getCaseEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseEmployee = await caseEmployeesService.getCaseEmployeeById(id);
    res.status(200).json({
      success: true,
      data: caseEmployee,
      message: "Case employee retrieved successfully"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const getCaseEmployeesByCaseId = async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseEmployees = await caseEmployeesService.getCaseEmployeesByCaseId(caseId);
    res.status(200).json({
      success: true,
      data: caseEmployees,
      message: "Case employees retrieved successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getCaseEmployeesByName = async (req, res) => {
  try {
    const { name } = req.params;
    const caseEmployees = await caseEmployeesService.getCaseEmployeesByName(name);
    res.status(200).json({
      success: true,
      data: caseEmployees,
      message: "Case employees retrieved successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllCaseEmployees,
  createCaseEmployee,
  updateCaseEmployee,
  deleteCaseEmployee,
  getCaseEmployeeById,
  getCaseEmployeesByCaseId,
  getCaseEmployeesByName
};