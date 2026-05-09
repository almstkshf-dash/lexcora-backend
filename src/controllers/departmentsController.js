const departmentsService = require('../services/departmentsService');

const getAllDepartments = async (req, res) => {
  try {
    const departments = await departmentsService.getAllDepartments();
    res.list(departments || []);
  } catch (error) {
    console.error('[GET_ALL_DEPARTMENTS_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('department.failedFetch'), 500, 'DEPARTMENTS_LIST_ERROR');
  }
};

const createDepartment = async (req, res) => {
  try {
    const departmentId = await departmentsService.createDepartment(req.body);
    res.created({ id: departmentId }, req.t('generic.created'));
  } catch (error) {
    console.error('[CREATE_DEPARTMENT_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('department.failedCreate'), 500, 'DEPARTMENT_CREATE_ERROR');
  }
};

const updateDepartment = async (req, res) => {
  try {
    const success = await departmentsService.updateDepartment(req.params.id, req.body);
    if (success) {
      res.success(null, req.t('generic.ok'));
    } else {
      res.fail(req.t('department.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[UPDATE_DEPARTMENT_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('department.failedUpdate'), 500, 'DEPARTMENT_UPDATE_ERROR');
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const success = await departmentsService.deleteDepartment(req.params.id);
    if (success) {
      res.success(null, req.t('generic.ok'));
    } else {
      res.fail(req.t('department.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_DEPARTMENT_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('department.failedDelete'), 500, 'DEPARTMENT_DELETE_ERROR');
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await departmentsService.getDepartmentById(req.params.id);
    if (department) {
      res.success(department);
    } else {
      res.fail(req.t('department.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[GET_DEPARTMENT_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('department.failedFetch'), 500, 'DEPARTMENT_GET_ERROR');
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentById
};