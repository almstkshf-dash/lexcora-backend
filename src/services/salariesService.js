const salariesModel = require("../models/salariesModel");
const employeeModel = require("../models/employeeModel");
const deductionsModel = require("../models/deductionsModel");
const accountingService = require("./accountingService");
const db = require("../config/db");
const { logAdd, logUpdate } = require('./logsService');

const listSalaries = async (filters) => {
  return await salariesModel.getAllSalaries(filters);
};

const getSalary = async (id) => {
  return await salariesModel.getSalaryById(id);
};

const processMonthlyPayroll = async (employeeId, payPeriod, extraData = {}, createdBy) => {
  // 1. Get employee details for base salary and fixed allowances
  const employee = await employeeModel.getEmployeeById(employeeId);
  if (!employee) throw new Error("Employee not found");

  // 2. Fetch deductions for this period
  const deductionsList = await deductionsModel.getAllDeductions(employeeId);
  const totalDeductions = deductionsList.reduce((sum, d) => sum + parseFloat(d.amount), 0);

  // 3. Prepare salary data
  const baseSalary = parseFloat(employee.basic_salary) || 0;
  const housingAllowance = parseFloat(employee.housing_allowance) || 0;
  const transportationAllowance = parseFloat(employee.trnsportation_allownce) || 0;
  const otherAllowance = parseFloat(employee.another_allownce) || 0;
  
  const incentives = parseFloat(extraData.incentives) || 0;
  const bonuses = parseFloat(extraData.bonuses) || 0;
  const eosAmount = parseFloat(extraData.eosAmount) || 0;
  const overtimeAmount = parseFloat(extraData.overtimeAmount) || 0;

  const totalAllowances = housingAllowance + transportationAllowance + otherAllowance + incentives + bonuses + overtimeAmount;
  const netSalary = (baseSalary + totalAllowances + eosAmount) - totalDeductions;

  const salaryData = {
    employee_id: employeeId,
    base_salary: baseSalary,
    allowances: totalAllowances,
    deductions: totalDeductions,
    incentives,
    bonuses,
    eos_amount: eosAmount,
    housing_allowance: housingAllowance,
    transportation_allowance: transportationAllowance,
    other_allowance: otherAllowance,
    overtime_amount: overtimeAmount,
    net_salary: netSalary,
    pay_period: payPeriod,
    status: 'processed',
    notes: extraData.notes || ''
  };

  const salaryId = await salariesModel.createSalary(salaryData);

  // 4. Post to Accounting (Accrual)
  await accountingService.postAutomatedEntry('SALARY_PROCESSED', {
    amount: netSalary,
    description: `Payroll for ${employee.name} - ${payPeriod}`,
    reference: `SAL-${salaryId}`,
    employee_id: employeeId,
    employee_name: employee.name,
    pay_period: payPeriod,
    branch_id: employee.branch_id,
    created_by: createdBy
  });

  await logAdd(createdBy, 'راتب', `معالجة راتب ${employee.name} لفترة ${payPeriod}`, salaryId);

  return salaryId;
};

const markAsPaid = async (id, paymentData, updatedBy) => {
  const salary = await salariesModel.getSalaryById(id);
  if (!salary) throw new Error("Salary record not found");

  const success = await salariesModel.updateSalary(id, {
    status: 'paid',
    payment_date: paymentData.paymentDate || new Date(),
    notes: salary.notes + (paymentData.notes ? `\nPayment Note: ${paymentData.notes}` : '')
  });

  if (success) {
    // Post to Accounting (Payment)
    await accountingService.postAutomatedEntry('SALARY_PAID', {
      amount: salary.net_salary,
      description: `Salary paid to ${salary.employee_name} - ${salary.pay_period}`,
      reference: `PAY-${id}`,
      employee_id: salary.employee_id,
      employee_name: salary.employee_name,
      pay_period: salary.pay_period,
      branch_id: salary.branch_id,
      created_by: updatedBy
    });

    await logUpdate(updatedBy, 'راتب', `دفع راتب ${salary.employee_name} لفترة ${salary.pay_period}`, id);
  }

  return success;
};

module.exports = {
  listSalaries,
  getSalary,
  processMonthlyPayroll,
  markAsPaid
};
