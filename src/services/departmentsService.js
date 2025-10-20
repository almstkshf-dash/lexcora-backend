// departmentsService.js
// Service functions for departments

const departmentsModel = require('../models/departmentsModel');

const getAllDepartments = async () => {
  return await departmentsModel.getAllDepartments();
};

const createDepartment = async (department) => {
  return await departmentsModel.createDepartment(department);
};

const updateDepartment = async (id, department) => {
  return await departmentsModel.updateDepartment(id, department);
};

const deleteDepartment = async (id) => {
  return await departmentsModel.deleteDepartment(id);
};

const getDepartmentById = async (id) => {
  return await departmentsModel.getDepartmentById(id);
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentById
};