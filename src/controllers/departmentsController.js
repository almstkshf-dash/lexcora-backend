const departmentsService = require('../services/departmentsService');

const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentsService.getAllDepartments();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
};

const createDepartment = async (req, res) => {
  try {
    const departmentId = await departmentsService.createDepartment(req.body);
    res.status(201).json({ id: departmentId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create department' });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const success = await departmentsService.updateDepartment(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Department updated' });
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update department' });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const success = await departmentsService.deleteDepartment(req.params.id);
    if (success) {
      res.json({ message: 'Department deleted' });
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await departmentsService.getDepartmentById(req.params.id);
    if (department) {
      res.json(department);
    } else {
      res.status(404).json({ error: 'Department not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department' });
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentById
};