const caseEmployeesModel = require("../models/caseEmployeesModel");

const getAllCaseEmployees = async () => {
  try {
    return await caseEmployeesModel.getAllCaseEmployees();
  } catch (error) {
    throw new Error(`Error fetching case employees: ${error.message}`);
  }
};

const createCaseEmployee = async (caseEmployeeData) => {
  try {
    const { case_id, name, url } = caseEmployeeData;
    
    if (!case_id || !name || !url) {
      throw new Error("Case ID, name, and URL are required fields");
    }

    return await caseEmployeesModel.createCaseEmployee(caseEmployeeData);
  } catch (error) {
    throw new Error(`Error creating case employee: ${error.message}`);
  }
};

const updateCaseEmployee = async (id, caseEmployeeData) => {
  try {
    if (!id) {
      throw new Error("Case employee ID is required");
    }

    const existingEmployee = await caseEmployeesModel.getCaseEmployeeById(id);
    if (!existingEmployee) {
      throw new Error("Case employee not found");
    }

    return await caseEmployeesModel.updateCaseEmployee(id, caseEmployeeData);
  } catch (error) {
    throw new Error(`Error updating case employee: ${error.message}`);
  }
};

const deleteCaseEmployee = async (id) => {
  try {
    if (!id) {
      throw new Error("Case employee ID is required");
    }

    const existingEmployee = await caseEmployeesModel.getCaseEmployeeById(id);
    if (!existingEmployee) {
      throw new Error("Case employee not found");
    }

    return await caseEmployeesModel.deleteCaseEmployee(id);
  } catch (error) {
    throw new Error(`Error deleting case employee: ${error.message}`);
  }
};

const getCaseEmployeeById = async (id) => {
  try {
    if (!id) {
      throw new Error("Case employee ID is required");
    }

    const employee = await caseEmployeesModel.getCaseEmployeeById(id);
    if (!employee) {
      throw new Error("Case employee not found");
    }

    return employee;
  } catch (error) {
    throw new Error(`Error fetching case employee: ${error.message}`);
  }
};

const getCaseEmployeesByCaseId = async (caseId) => {
  try {
    if (!caseId) {
      throw new Error("Case ID is required");
    }

    return await caseEmployeesModel.getCaseEmployeesByCaseId(caseId);
  } catch (error) {
    throw new Error(`Error fetching case employees by case ID: ${error.message}`);
  }
};

const getCaseEmployeesByName = async (name) => {
  try {
    if (!name) {
      throw new Error("Employee name is required");
    }

    return await caseEmployeesModel.getCaseEmployeesByName(name);
  } catch (error) {
    throw new Error(`Error fetching case employees by name: ${error.message}`);
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