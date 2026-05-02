const employeeRequestsModel = require("../models/employeeRequestsModel");
const journalEntriesModel   = require("../models/journalEntriesModel");
const db = require("../config/db");

const ALLOWED_APPROVALS = ['approved', 'rejected', 'pending'];

// ─────────────────────────────────────────────────────────────────
// Helper: check if user holds a named permission
// ─────────────────────────────────────────────────────────────────
const userHasPermission = async (userId, permissionEn) => {
  const [rows] = await db.query(`
    SELECT 1
    FROM employee_permissions ep
    INNER JOIN permissions p ON ep.permission_id = p.id
    WHERE ep.employee_id = ? AND p.permission_en = ?
    LIMIT 1
  `, [userId, permissionEn]);
  return rows.length > 0;
};

// ─────────────────────────────────────────────────────────────────
// GET /hr/requests  — list with all finance fields
// ─────────────────────────────────────────────────────────────────
const getEmployeeRequests = async (req, res) => {
  try {
    const {
      employee_id, page = 1, limit = 20,
      manager_approval, hr_approval, finance_approval,
      type, search
    } = req.query;

    const filters = {
      employeeId:      employee_id || null,
      page:            parseInt(page),
      limit:           parseInt(limit),
      managerApproval: manager_approval  || null,
      hrApproval:      hr_approval       || null,
      financeApproval: finance_approval  || null,
      type:            type              || null,
      search:          search            || null
    };

    const result = await employeeRequestsModel.getAllEmployeeRequests(filters);

    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /hr/requests/:id
// ─────────────────────────────────────────────────────────────────
const getEmployeeRequest = async (req, res) => {
  try {
    const request = await employeeRequestsModel.getEmployeeRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Employee request not found" });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /hr/requests/employee/:employeeId
// ─────────────────────────────────────────────────────────────────
const getRequestsByEmployeeId = async (req, res) => {
  try {
    const result = await employeeRequestsModel.getAllEmployeeRequests({
      employeeId: req.params.employeeId,
      page: 1, limit: 1000
    });
    res.json({ success: true, data: result.data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// POST /hr/requests — create (finance values auto-populated)
// ─────────────────────────────────────────────────────────────────
const createEmployeeRequest = async (req, res) => {
  try {
    const { employee_id, type, from_date, to_date, reason, notes } = req.body;
    if (!employee_id || !type)
      return res.status(400).json({ success: false, message: "employee_id and type are required" });

    const created_by = req.user.id;
    const date = new Date().toISOString().split('T')[0];

    // If caller supplies financial overrides, gate them behind permissions
    let payTypeOverride, dailyRateOverride, leaveValueOverride;
    const isAdmin = req.user.role_en === 'admin';

    if (req.body.leave_pay_type !== undefined) {
      const canEdit = isAdmin || await userHasPermission(created_by, 'Edit Leave Pay Type');
      if (!canEdit) return res.status(403).json({ success: false, message: "ليس لديك صلاحية لتعديل نوع دفع الإجازة" });
      payTypeOverride = req.body.leave_pay_type;
    }
    if (req.body.daily_rate !== undefined || req.body.leave_value_aed !== undefined) {
      const canEdit = isAdmin
        || await userHasPermission(created_by, 'Edit Paid Leave Value')
        || await userHasPermission(created_by, 'Edit Unpaid Leave Value');
      if (!canEdit) return res.status(403).json({ success: false, message: "ليس لديك صلاحية لتعديل قيمة الإجازة" });
      dailyRateOverride  = req.body.daily_rate;
      leaveValueOverride = req.body.leave_value_aed;
    }

    const requestId = await employeeRequestsModel.createEmployeeRequest({
      employee_id, date, type, from_date, to_date, reason, notes, created_by,
      leave_pay_type:    payTypeOverride,
      daily_rate:        dailyRateOverride,
      leave_value_aed:   leaveValueOverride,
    });

    const newRequest = await employeeRequestsModel.getEmployeeRequestById(requestId);
    res.status(201).json({ success: true, message: "Employee request created successfully", data: newRequest });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PUT /hr/requests/:id — update basic fields
// ─────────────────────────────────────────────────────────────────
const updateEmployeeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, from_date, to_date, reason, notes } = req.body;
    if (!date || !type)
      return res.status(400).json({ success: false, message: "date and type are required" });

    const existing = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Employee request not found" });

    await employeeRequestsModel.updateEmployeeRequest(id, { date, type, from_date, to_date, reason, notes });
    const updated = await employeeRequestsModel.getEmployeeRequestById(id);
    res.json({ success: true, message: "Employee request updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PATCH /hr/requests/:id/financial-values
// Only users with 'Edit Paid/Unpaid Leave Value' or 'Edit Leave Pay Type' can call this
// ─────────────────────────────────────────────────────────────────
const updateLeaveFinancialValues = async (req, res) => {
  try {
    const { id } = req.params;
    const { leave_pay_type, days_count, daily_rate, leave_value_aed, account_id, contra_account_id } = req.body;
    const userId  = req.user.id;
    const isAdmin = req.user.role_en === 'admin';

    // Gate: must hold at least one finance permission
    const canEditPaid   = isAdmin || await userHasPermission(userId, 'Edit Paid Leave Value');
    const canEditUnpaid = isAdmin || await userHasPermission(userId, 'Edit Unpaid Leave Value');
    const canEditType   = isAdmin || await userHasPermission(userId, 'Edit Leave Pay Type');

    if (!canEditPaid && !canEditUnpaid && !canEditType)
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية لتعديل القيم المالية للإجازة" });

    const existing = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Employee request not found" });

    await employeeRequestsModel.updateLeaveFinancialValues(id, {
      leave_pay_type: leave_pay_type || existing.leave_pay_type,
      days_count:     days_count     ?? existing.days_count,
      daily_rate:     daily_rate     ?? existing.daily_rate,
      leave_value_aed: leave_value_aed ?? existing.leave_value_aed,
      account_id:     account_id     ?? existing.account_id,
      contra_account_id: contra_account_id ?? existing.contra_account_id,
    });

    const updated = await employeeRequestsModel.getEmployeeRequestById(id);
    res.json({ success: true, message: "Financial values updated successfully", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PATCH /hr/requests/:id/manager-approval
// ─────────────────────────────────────────────────────────────────
const updateManagerApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { manager_approval } = req.body;
    if (!manager_approval || !ALLOWED_APPROVALS.includes(manager_approval))
      return res.status(400).json({ success: false, message: "manager_approval must be approved|rejected|pending" });

    const existing = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Employee request not found" });

    await employeeRequestsModel.updateManagerApproval(id, manager_approval);
    const updated = await employeeRequestsModel.getEmployeeRequestById(id);
    res.json({ success: true, message: "Manager approval updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PATCH /hr/requests/:id/hr-approval
// ─────────────────────────────────────────────────────────────────
const updateHrApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { hr_approval } = req.body;
    if (!hr_approval || !ALLOWED_APPROVALS.includes(hr_approval))
      return res.status(400).json({ success: false, message: "hr_approval must be approved|rejected|pending" });

    const existing = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Employee request not found" });

    await employeeRequestsModel.updateHrApproval(id, hr_approval);
    const updated = await employeeRequestsModel.getEmployeeRequestById(id);
    res.json({ success: true, message: "HR approval updated", data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// PATCH /hr/requests/:id/finance-approval
// Requires permission: 'Finance Approve HR Request'
// If approved → auto-create & post journal entry
// ─────────────────────────────────────────────────────────────────
const updateFinanceApproval = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const { finance_approval, finance_notes } = req.body;
    const userId  = req.user.id;
    const isAdmin = req.user.role_en === 'admin';

    if (!finance_approval || !ALLOWED_APPROVALS.includes(finance_approval))
      return res.status(400).json({ success: false, message: "finance_approval must be approved|rejected|pending" });

    // Gate: Finance Approve HR Request permission
    const canApprove = isAdmin || await userHasPermission(userId, 'Finance Approve HR Request');
    if (!canApprove)
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية للموافقة المالية على الطلبات" });

    const existing = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Employee request not found" });

    await connection.beginTransaction();

    // Update finance approval
    await employeeRequestsModel.updateFinanceApproval(id, finance_approval, finance_notes, userId, connection);

    // Auto-create journal entry when finance approves a paid/partial leave with value
    if (
      finance_approval === 'approved'
      && existing.leave_value_aed > 0
      && existing.account_id
      && existing.contra_account_id
      && !existing.journal_entry_id  // don't double-create
    ) {
      const employeeName = existing.employee_name || `Employee #${existing.employee_id}`;
      const typeLabel    = existing.type;
      const desc = `إجازة موظف - ${employeeName} - ${typeLabel} (${existing.from_date || ''} → ${existing.to_date || ''})`;

      const journalResult = await journalEntriesModel.createJournalEntry(
        {
          entry_date:       new Date().toISOString().split('T')[0],
          reference_number: `HR-REQ-${id}`,
          description:      desc,
          currency_code:    'AED',
          exchange_rate:    1.0,
          status:           'posted',
          created_by:       userId,
          branch_id:        null
        },
        [
          // Debit: Leave Expense account
          {
            account_id:  existing.account_id,
            employee_id: existing.employee_id,
            description: desc,
            debit:       existing.leave_value_aed,
            credit:      0
          },
          // Credit: Accrued Liability / Payroll Payable
          {
            account_id:  existing.contra_account_id,
            employee_id: existing.employee_id,
            description: desc,
            debit:       0,
            credit:      existing.leave_value_aed
          }
        ],
        connection
      );

      if (journalResult?.data?.id) {
        await employeeRequestsModel.linkJournalEntry(id, journalResult.data.id);
      }
    }

    await connection.commit();
    const updated = await employeeRequestsModel.getEmployeeRequestById(id);
    res.json({ success: true, message: "Finance approval updated", data: updated });
  } catch (err) {
    await connection.rollback();
    console.error('Finance approval error:', err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────
// GET /hr/requests/finance-summary?start_date=&end_date=&department_id=
// Requires permission: 'View HR Request Financial Cost'
// ─────────────────────────────────────────────────────────────────
const getFinanceSummary = async (req, res) => {
  try {
    const userId  = req.user.id;
    const isAdmin = req.user.role_en === 'admin';
    const canView = isAdmin || await userHasPermission(userId, 'View HR Request Financial Cost');
    if (!canView)
      return res.status(403).json({ success: false, message: "ليس لديك صلاحية لعرض التكلفة المالية للطلبات" });

    const { start_date, end_date, department_id } = req.query;
    const summary = await employeeRequestsModel.getHRFinanceSummary({ start_date, end_date, department_id });
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────
// DELETE /hr/requests/:id
// ─────────────────────────────────────────────────────────────────
const deleteEmployeeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await employeeRequestsModel.getEmployeeRequestById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Employee request not found" });
    await employeeRequestsModel.deleteEmployeeRequest(id);
    res.json({ success: true, message: "Employee request deleted successfully" });
  } catch (err) {
    console.error('Error deleting employee request:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getEmployeeRequests,
  getEmployeeRequest,
  getRequestsByEmployeeId,
  createEmployeeRequest,
  updateEmployeeRequest,
  updateLeaveFinancialValues,
  updateManagerApproval,
  updateHrApproval,
  updateFinanceApproval,
  getFinanceSummary,
  deleteEmployeeRequest
};
