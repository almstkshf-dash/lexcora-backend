const employeeService = require("../services/employeeService");

// Get all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await employeeService.listEmployees();
    res.json({
      success: true,
      data: employees,
      count: employees.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get employee by ID
const getEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await employeeService.getEmployee(id);
    
    // Check if user is admin
    const isAdmin = req.user && (req.user.role_en === 'admin');
    
    // Mask password for non-admin users
    const employeeData = {
      ...employee,
      password: isAdmin ? employee.password : '********'
    };
    
    res.json({
      success: true,
      data: employeeData
    });
  } catch (err) {
    const statusCode = err.message === "Employee not found" ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new employee
const createEmployee = async (req, res) => {
  try {
    const createdBy = req.user?.id || null;
    const employeeId = await employeeService.addEmployee(req.body, createdBy);
    const newEmployee = await employeeService.getEmployee(employeeId);
    res.status(201).json({ 
      success: true,
      message: "Employee created successfully",
      data: newEmployee
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || null;
    const updatedEmployee = await employeeService.updateEmployee(id, req.body, updatedBy);
    res.json({
      success: true,
      message: "Employee updated successfully",
      data: updatedEmployee
    });
  } catch (err) {
    const statusCode = err.message === "Employee not found" ? 404 : 400;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.id || null;
    const result = await employeeService.removeEmployee(id, deletedBy);
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    const statusCode = err.message === "Employee not found" ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
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


module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeAccountStatement,
};