const salariesService = require("../services/salariesService");

const getSalaries = async (req, res) => {
  try {
    const filters = {
      employeeId: req.query.employeeId,
      payPeriod: req.query.payPeriod,
      status: req.query.status,
      branchId: req.query.branchId
    };
    const salaries = await salariesService.listSalaries(filters);
    res.json({ success: true, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalaryById = async (req, res) => {
  try {
    const salary = await salariesService.getSalary(req.params.id);
    if (!salary) {
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }
    res.json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const processPayroll = async (req, res) => {
  try {
    const { employeeId, payPeriod, extraData } = req.body;
    const salaryId = await salariesService.processMonthlyPayroll(
      employeeId, 
      payPeriod, 
      extraData, 
      req.user.id
    );
    res.status(201).json({ success: true, data: { id: salaryId } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const paySalary = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const success = await salariesService.markAsPaid(id, paymentData, req.user.id);
    res.json({ success, message: success ? "Salary marked as paid" : "Failed to mark salary as paid" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSalaries,
  getSalaryById,
  processPayroll,
  paySalary
};
