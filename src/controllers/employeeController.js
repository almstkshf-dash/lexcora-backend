const employeeService = require("../services/employeeService");
const { normalizePagination } = require("../utils/pagination");
const { isConstraintError, getConstraintErrorMessage } = require('../utils/dbErrors');

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = normalizePagination(
      req.query,
      ['name', 'status', 'username', 'id', 'balance']
    );
    const search = req.query.search ? String(req.query.search).trim() : null;

    const result = await employeeService.listEmployees({ page, limit, sortBy, sortOrder, search });
    res.list(result.data || result, req.t('generic.ok'), result.pagination);
  } catch (err) {
    console.error('[GET_EMPLOYEES_ERROR]', { message: err.message, stack: err.stack, query: req.query });
    res.fail(err.message, 500, 'EMPLOYEE_LIST_ERROR');
  }
};

// Get employee by ID
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = req.user && (req.user.role_en === 'admin');
    const employee = await employeeService.getEmployeeSanitized(id, { maskPassword: !isAdmin });
    res.success(employee, req.t('generic.ok'));
  } catch (err) {
    console.error('[GET_EMPLOYEE_ERROR]', {
      id: req.params.id,
      message: err.message,
      stack: err.stack
    });
    const statusCode = err.message === "Employee not found" ? 404 : 500;
    res.fail(err.message, statusCode, statusCode === 404 ? 'NOT_FOUND' : 'EMPLOYEE_GET_ERROR');
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const createdBy = req.user?.id || null;
    const newEmployee = await employeeService.addEmployeeWithFetch(req.body, createdBy);
    res.created(newEmployee, req.t('generic.created'));
  } catch (err) {
    console.error('[CREATE_EMPLOYEE_ERROR]', { message: err.message, stack: err.stack, body: req.body });
    res.fail(err.message, 400, 'EMPLOYEE_CREATE_ERROR');
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || null;
    const updatedEmployee = await employeeService.updateEmployee(id, req.body, updatedBy);
    res.success(updatedEmployee, req.t('generic.ok'));
  } catch (err) {
    console.error('[UPDATE_EMPLOYEE_ERROR]', { message: err.message, stack: err.stack, params: req.params, body: req.body });
    const statusCode = err.message === "Employee not found" ? 404 : 400;
    res.fail(err.message, statusCode, statusCode === 404 ? 'NOT_FOUND' : 'EMPLOYEE_UPDATE_ERROR');
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.id || null;
    const result = await employeeService.removeEmployee(id, deletedBy);
    res.success(null, result.message);
  } catch (err) {
    console.error(`[DELETE_EMPLOYEE_ERROR] id=${req.params.id}:`, err);
    
    if (isConstraintError(err)) {
      return res.fail(getConstraintErrorMessage(req), 400, 'EMPLOYEE_HAS_RECORDS');
    }

    res.fail(req.t('employee.failedDeleteEmployee'), 500, 'DELETE_EMPLOYEE_ERROR');
  }
};

// Get employee account statement
const getEmployeeAccountStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
    const result = await employeeService.getEmployeeAccountStatement(id, from, to);
    
    if (result.success) {
      res.list(result.data || result, req.t('generic.ok'), result.pagination);
    } else {
      res.fail(result.message || req.t('generic.internalError'), 400, 'STATEMENT_FETCH_FAILED');
    }
  } catch (err) {
    console.error('[GET_EMPLOYEE_STATEMENT_ERROR]', { message: err.message, stack: err.stack, params: req.params, query: req.query });
    res.fail(err.message, 500, 'STATEMENT_ERROR');
  }
};

const checkDuplicateEmployee = async (req, res) => {
  try {
    const { name, phone, email, excludeId } = req.query;
    
    if (!name && !phone && !email) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    const duplicate = await employeeService.checkDuplicateEmployee(name, phone, email, excludeId);
    
    if (duplicate) {
      return res.success({
        isDuplicate: true,
        duplicate: {
          id: duplicate.id,
          name: duplicate.name,
          phone: duplicate.phone,
          email: duplicate.email
        }
      });
    }
    
    res.success({
      isDuplicate: false
    });
  } catch (error) {
    console.error('[CHECK_DUPLICATE_EMPLOYEE_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('notify.serverError'), 500, 'CHECK_DUPLICATE_FAILED');
  }
};


module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeAccountStatement,
  checkDuplicateEmployee
};
