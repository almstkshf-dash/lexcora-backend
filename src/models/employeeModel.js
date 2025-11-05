const e = require("express");
const db = require("../config/db");
const { generateCredentials } = require("../utils/generateCredentials");

const getAllEmployees = async () => {
  const [rows] = await db.query(`
    SELECT 
      e.name,
      e.status,
      e.username,
      e.id,
      d.name_ar as department_ar,
      d.name_en as department_en,
      m.name as managerName,
      r.role_ar,
      r.role_en
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    
    LEFT JOIN employees m ON e.direct_manager_id = m.id
    LEFT JOIN roles r ON e.role_id = r.id
    WHERE r.role_en != 'admin' OR r.role_en IS NULL
  `);
return rows;
};

const getEmployeeById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      e.*, 
      d.name_ar as department_ar,
      d.name_en as department_en,
      m.name as managerName,
      r.role_ar,
      r.role_en,
      ed.id as document_id,
      ed.document_name,
      ed.document_url,
      ed.created_at as document_created_at,
      ed.uploaded_by
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN employees m ON e.direct_manager_id = m.id
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN employee_documents ed ON e.id = ed.employee_id
    WHERE e.id = ? 
  `, [id]);
  
  if (rows.length === 0) return null;
  
  const employee = rows[0];
  
  // Extract documents and remove duplicates
  const documents = [];
  const documentIds = new Set();
  
  rows.forEach(row => {
    if (row.document_id && !documentIds.has(row.document_id)) {
      documentIds.add(row.document_id);
      documents.push({
        id: row.document_id,
        document_name: row.document_name,
        document_url: row.document_url,
        created_at: row.document_created_at,
        uploaded_by: row.uploaded_by
      });
    }
  });
  
  // Remove document fields from employee object
  const { document_id, document_name, document_url, document_created_at, uploaded_by, ...cleanEmployee } = employee;
  
  return {
    ...cleanEmployee,
    documents
  };
};
  
const createEmployee = async (employee) => {
  
  const {
    name,
    username,
    roleId,
    employeeNumber,
    email,
    identityNumber,
    passportNumber,
    phoneNumber,  
    departmentId,
    directManagerId =null,
    identityExpiryDate,
    passportExpiryDate,
    workPermitExpiryDate,
    insuranceExpiryDate,
    contractExpiryDate,
    basicSalary = 0,
    branchId,
    residenceExpiryDate,
    status = 'active',
    accountCloseDate,
    anotherAllowance = 0,
    accountActivationDate,
    firstDayOfWork,
    housingAllowance = 0,
    transportationAllowance = 0,
    payType,
    iban,
    accountNumber,
    bankName,
    contractType,
    registrationExpirationDate
  } = employee;

  // Helper function to convert empty strings to null for date fields
  const normalizeDate = (date) => {
    if (date === '' || date === undefined || date === null) {
      return null;
    }
    return date;
  };

  // Helper function to convert empty strings to null for optional fields
  const normalizeValue = (value) => {
    if (value === '' || value === undefined) {
      return null;
    }
    return value;
  };

  // Generate password using utility function
  const credentials = await generateCredentials();
  const password = credentials.password;

  const [result] = await db.query(`
    INSERT INTO employees (
      name, username, password, role_id, job_id, email, eId, passport, phone, department_id, direct_manager_id,
    residence_end_date, id_end_date, passport_end_date, labor_card_end_date,
      health_insurance_end_date, contract_end_date, basic_salary, branch_id, status,
      account_close_date, another_allownce, account_activation_date, fisrt_day_of_work,
      housing_allowance, trnsportation_allownce, pay_type, iban, account_number, bank_name, contract_type,
      registration_expiration_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    name, 
    username, 
    password, 
    roleId, 
    normalizeValue(employeeNumber), 
    email, 
    normalizeValue(identityNumber), 
    normalizeValue(passportNumber), 
    phoneNumber, 
    departmentId, 
    normalizeValue(directManagerId),
    normalizeDate(residenceExpiryDate), 
    normalizeDate(identityExpiryDate), 
    normalizeDate(passportExpiryDate), 
    normalizeDate(workPermitExpiryDate),
    normalizeDate(insuranceExpiryDate), 
    normalizeDate(contractExpiryDate), 
    basicSalary || 0, 
    branchId, 
    status,
    normalizeDate(accountCloseDate), 
    anotherAllowance || 0, 
    normalizeDate(accountActivationDate), 
    normalizeDate(firstDayOfWork),
    housingAllowance || 0, 
    transportationAllowance || 0, 
    normalizeValue(payType), 
    normalizeValue(iban), 
    normalizeValue(accountNumber), 
    normalizeValue(bankName), 
    normalizeValue(contractType),
    normalizeDate(registrationExpirationDate)
  ]);
  
  return result.insertId;
};

const updateEmployee = async (id, employee) => {
  const {
    name,
    username,
    password,
    roleId,
    employeeNumber,
    email,
    identityNumber,
    passportNumber,
    phoneNumber,
    phone, // Support both phoneNumber and phone
    departmentId,
    branchId,
    directManagerId,
    status,
    residenceEndDate,
    residenceExpiryDate, // Support both naming conventions
    idEndDate,
    identityExpiryDate, // Support both naming conventions
    passportEndDate,
    passportExpiryDate, // Support both naming conventions
    laborCardEndDate,
    workPermitExpiryDate, // Support both naming conventions
    healthInsuranceEndDate,
    insuranceExpiryDate, // Support both naming conventions
    contractEndDate,
    contractExpiryDate, // Support both naming conventions
    basicSalary = 0,
    accountCloseDate,
    anotherAllowance = 0,
    accountActivationDate,
    firstDayOfWork,
    housingAllowance = 0,
    transportationAllowance = 0,
    payType,
    iban,
    accountNumber,
    bankName,
    contractType,
    registrationExpirationDate,
    registrationExpiryDate // Support both naming conventions
  } = employee;

  // Helper function to convert empty strings to null for date fields
  const normalizeDate = (date) => {
    if (date === '' || date === undefined || date === null) {
      return null;
    }
    return date;
  };

  // Helper function to convert empty strings to null for optional fields
  const normalizeValue = (value) => {
    if (value === '' || value === undefined) {
      return null;
    }
    return value;
  };

  // Use the correct field names (support both naming conventions)
  const finalPhone = phoneNumber || phone;
  const finalResidenceEndDate = residenceExpiryDate || residenceEndDate;
  const finalIdEndDate = identityExpiryDate || idEndDate;
  const finalPassportEndDate = passportExpiryDate || passportEndDate;
  const finalLaborCardEndDate = workPermitExpiryDate || laborCardEndDate;
  const finalHealthInsuranceEndDate = insuranceExpiryDate || healthInsuranceEndDate;
  const finalContractEndDate = contractExpiryDate || contractEndDate;
  const finalRegistrationExpirationDate = registrationExpiryDate || registrationExpirationDate;

  // Build the query dynamically to include password only if it's not masked
  let query = `UPDATE employees SET
    name = ?, username = ?, role_id = ?, job_id = ?, email = ?, 
    eId = ?, passport = ?, phone = ?, department_id = ?, branch_id = ?,
    direct_manager_id = ?, status = ?, residence_end_date = ?, id_end_date = ?,
    passport_end_date = ?, labor_card_end_date = ?, health_insurance_end_date = ?,
    contract_end_date = ?, basic_salary = ?,
    account_close_date = ?, another_allownce = ?, account_activation_date = ?,
    fisrt_day_of_work = ?, housing_allowance = ?, trnsportation_allownce = ?,
    pay_type = ?, iban = ?, account_number = ?, bank_name = ?, contract_type = ?,
    registration_expiration_date = ?`;
  
  let params = [
    normalizeValue(name),
    normalizeValue(username),
    normalizeValue(roleId),
    normalizeValue(employeeNumber),
    normalizeValue(email),
    normalizeValue(identityNumber),
    normalizeValue(passportNumber),
    normalizeValue(finalPhone),
    normalizeValue(departmentId),
    normalizeValue(branchId),
    normalizeValue(directManagerId),
    normalizeValue(status) || 'active',
    normalizeDate(finalResidenceEndDate), 
    normalizeDate(finalIdEndDate), 
    normalizeDate(finalPassportEndDate), 
    normalizeDate(finalLaborCardEndDate),
    normalizeDate(finalHealthInsuranceEndDate), 
    normalizeDate(finalContractEndDate), 
    basicSalary || 0,
    normalizeDate(accountCloseDate), 
    anotherAllowance || 0, 
    normalizeDate(accountActivationDate),
    normalizeDate(firstDayOfWork), 
    housingAllowance || 0, 
    transportationAllowance || 0,
    normalizeValue(payType), 
    normalizeValue(iban), 
    normalizeValue(accountNumber), 
    normalizeValue(bankName), 
    normalizeValue(contractType),
    normalizeDate(finalRegistrationExpirationDate)
  ];
  
  // Only update password if it's provided and not masked
  if (password && password !== '********') {
    query = query.replace('registration_expiration_date = ?', 'registration_expiration_date = ?, password = ?');
    params.push(password);
  }
  
  query += ' WHERE id = ?';
  params.push(id);

  const [result] = await db.query(query, params);
  
  return result.affectedRows > 0;
};

const deleteEmployee = async (id) => {
  const [result] = await db.query("DELETE FROM employees WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

// Auth-related functions (replacing user functions)
const getEmployeeByUsername = async (username) => {
  const [rows] = await db.query(`
    SELECT 
      e.*, 
      r.role_ar,
      r.role_en,
      d.name_ar as department_ar,
      d.name_en as department_en
    FROM employees e
    LEFT JOIN roles r ON e.role_id = r.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE e.username = ?
  `, [username]);
  
  return rows[0];
};

const updateEmployeePassword = async (id, newPassword) => {
  const [result] = await db.query(`
    UPDATE employees SET password = ? WHERE id = ?
  `, [newPassword, id]);
  
  return result.affectedRows > 0;
};

const getEmployeePermissions = async (employeeId) => {
  const [rows] = await db.query(`
    SELECT 
      p.id as permission_id,
      p.permission_ar,
      p.permission_en
    FROM permissions p
    INNER JOIN employee_permissions ep ON p.id = ep.permission_id 
    WHERE ep.employee_id = ?
    ORDER BY p.permission_ar ASC
  `, [employeeId]);
  
  return rows;
};

const updateEmployeeLastLogin = async (employeeId) => {
  const [result] = await db.query(`
    UPDATE employees SET last_login = NOW() WHERE id = ?
  `, [employeeId]);
  
  return result.affectedRows > 0;
};
const addCaseEmployeeDocument = async (case_id, document_name, document_url, uploaded_by = null) => {
  try {
    const [result] = await db.query(`
      INSERT INTO case_employees_documents (case_id, document_name, document_url, uploaded_by) VALUES (?, ?, ?, ?)
    `, [case_id, document_name, document_url, uploaded_by]);
    return result.insertId;
  } catch (error) {
    console.error('Error adding employee document:', error);
    throw error;
  }
};

const getCaseEmployeeDocuments = async (case_id) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM case_employees_documents WHERE case_id = ?
    `, [case_id]);
    return rows;
  } catch (error) {
    console.error('Error getting case employee documents:', error);
    throw error;
  }
};

const deleteCaseEmployeeDocument = async (documentId, case_id) => {
  try {
    const [result] = await db.query(`
      DELETE FROM case_employees_documents WHERE id = ? AND case_id = ?
    `, [documentId, case_id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting case employee document:', error);
    throw error;
  }
};

// Get employee account statement
const getEmployeeAccountStatement = async (employeeId, fromDate, toDate) => {
  try {
    let dateFilter = '';
    const params = [employeeId];
    
    if (fromDate && toDate) {
      dateFilter = 'AND DATE(created_at) BETWEEN ? AND ?';
      params.push(fromDate, toDate);
    } else if (fromDate) {
      dateFilter = 'AND DATE(created_at) >= ?';
      params.push(fromDate);
    } else if (toDate) {
      dateFilter = 'AND DATE(created_at) <= ?';
      params.push(toDate);
    }
    
    // Get wallet expenses where employee is related
    const expensesQuery = `
      SELECT 
        we.id,
        we.amount,
        we.invoice_date as transaction_date,
        we.created_at,
        we.created_by,
        'expense' as type,
        GROUP_CONCAT(wei.description SEPARATOR ', ') as description,
        we.invoice_number as reference,
        c.case_number,
        c.file_number,
        creator.name as created_by_name
      FROM wallet_expenses we
      LEFT JOIN wallet_expenses_items wei ON we.id = wei.wallet_expense_id
      LEFT JOIN cases c ON we.case_id = c.id
      LEFT JOIN employees creator ON we.created_by = creator.id
      WHERE we.employee_relat_id = ? ${dateFilter.replace(/created_at/g, 'we.created_at')}
      GROUP BY we.id
    `;
    
    // Get invoices where employee referred the client
    const invoicesQuery = `
      SELECT 
        i.id,
        i.amount,
        i.invoice_date as transaction_date,
        i.created_at,
        i.created_by,
        'income' as type,
        CONCAT('Invoice ', i.invoice_number, ' - ', c.name) as description,
        i.invoice_number as reference,
        NULL as case_number,
        NULL as file_number,
        creator.name as created_by_name
      FROM invoices i
      LEFT JOIN parties c ON i.client_id = c.id
      LEFT JOIN employees creator ON i.created_by = creator.id
      WHERE i.referred_by_employee_id = ? ${dateFilter.replace(/created_at/g, 'i.created_at')}
    `;
    
    // Get salaries/payments (if you have a salaries table)
    // This is a placeholder - adjust based on your actual salary/payment structure
    const salariesQuery = `
      SELECT 
        s.id,
        s.amount,
        s.payment_date as transaction_date,
        s.created_at,
        s.created_by,
        'salary' as type,
        CONCAT('Salary for ', DATE_FORMAT(s.payment_date, '%M %Y')) as description,
        s.payment_reference as reference,
        NULL as case_number,
        NULL as file_number,
        creator.name as created_by_name
      FROM employee_salaries s
      LEFT JOIN employees creator ON s.created_by = creator.id
      WHERE s.employee_id = ? ${dateFilter.replace(/created_at/g, 's.created_at')}
    `;
    
    // Execute queries
    const [expensesRows] = await db.query(expensesQuery, params);
    const [invoicesRows] = await db.query(invoicesQuery, params);
    
    // Try to get salaries (table might not exist)
    let salariesRows = [];
    try {
      const [rows] = await db.query(salariesQuery, params);
      salariesRows = rows;
    } catch (err) {
      // Salaries table might not exist, that's okay
    }
    
    // Combine all transactions
    const transactions = [...expensesRows, ...invoicesRows, ...salariesRows].sort((a, b) => {
      return new Date(b.transaction_date || b.created_at) - new Date(a.transaction_date || a.created_at);
    });
    
    return { success: true, data: transactions };
  } catch (error) {
    console.error('Error getting employee account statement:', error);
    return { success: false, message: error.message };
  }
};

const checkDuplicateEmployee = async (name, phone, email, excludeId = null) => {
  let query = `
    SELECT id, name, phone, email 
    FROM employees 
    WHERE (name = ? OR phone = ? OR email = ?)
  `;
  const params = [name, phone || '', email || ''];
  
  // If excludeId is provided, exclude that employee from the check (for updates)
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  
  query += ' LIMIT 1';
  
  const [rows] = await db.query(query, params);
  return rows[0] || null;
};

const getAdminEmployees = async () => {
  const [rows] = await db.query(`
    SELECT 
      e.id,
      e.name,
      e.status
    FROM employees e
    LEFT JOIN roles r ON e.role_id = r.id
    WHERE r.role_en = 'admin' AND e.status = 'active'
  `);
  return rows;
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  // Auth functions
  getEmployeeByUsername,
  updateEmployeePassword,
  getEmployeePermissions,
  updateEmployeeLastLogin,
  addCaseEmployeeDocument,
  getCaseEmployeeDocuments,
  deleteCaseEmployeeDocument,
  getEmployeeAccountStatement,
  checkDuplicateEmployee,
  getAdminEmployees
};