const employeeService = require("../services/employeeService");
const { normalizePagination } = require("../utils/pagination");

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = normalizePagination(
      req.query,
      ['name', 'status', 'username', 'id', 'balance']
    );
    const search = req.query.search ? String(req.query.search).trim() : null;

    const result = await employeeService.listEmployees({ page, limit, sortBy, sortOrder, search });
    res.success(result.data, req.t('generic.ok'), 200, result.pagination);
  } catch (err) {
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
    const statusCode = err.message === "Employee not found" ? 404 : 500;
    res.fail(err.message, statusCode, statusCode === 404 ? 'NOT_FOUND' : 'EMPLOYEE_DELETE_ERROR');
  }
};

// Get employee account statement
const getEmployeeAccountStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
    const result = await employeeService.getEmployeeAccountStatement(id, from, to);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error('Error in getEmployeeAccountStatement controller:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const checkDuplicateEmployee = async (req, res) => {
  try {
    const { name, phone, email, excludeId } = req.query;
    
    if (!name && !phone && !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, phone, or email is required' 
      });
    }
    
    const duplicate = await employeeService.checkDuplicateEmployee(name, phone, email, excludeId);
    
    if (duplicate) {
      return res.json({
        success: true,
        isDuplicate: true,
        duplicate: {
          id: duplicate.id,
          name: duplicate.name,
          phone: duplicate.phone,
          email: duplicate.email
        }
      });
    }
    
    res.json({
      success: true,
      isDuplicate: false
    });
  } catch (error) {
    console.error('Error checking duplicate employee:', error);
    res.status(500).json({ success: false, error: 'Failed to check duplicate' });
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
