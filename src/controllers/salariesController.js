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
    res.list(salaries || [], req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_SALARIES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('salary.failedFetch'), 500, 'SALARIES_LIST_ERROR');
  }
};

const getSalaryById = async (req, res) => {
  try {
    const salary = await salariesService.getSalary(req.params.id);
    if (!salary) {
      return res.fail(req.t('salary.notFound'), 404, 'SALARY_NOT_FOUND');
    }
    res.success(salary);
  } catch (error) {
    console.error('[GET_SALARY_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('salary.failedFetch'), 500, 'SALARY_FETCH_ERROR');
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
    res.created({ id: salaryId }, req.t('salary.payrollProcessed'));
  } catch (error) {
    console.error('[PROCESS_PAYROLL_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(error.message, 400, 'PAYROLL_PROCESS_ERROR');
  }
};

const paySalary = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const success = await salariesService.markAsPaid(id, paymentData, req.user.id);
    if (success) {
      res.success(null, req.t('salary.paid'));
    } else {
      res.fail(req.t('salary.failedToPay'), 400, 'SALARY_PAY_ERROR');
    }
  } catch (error) {
    console.error('[PAY_SALARY_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(error.message, 400, 'SALARY_PAY_ERROR');
  }
};

module.exports = {
  getSalaries,
  getSalaryById,
  processPayroll,
  paySalary
};
