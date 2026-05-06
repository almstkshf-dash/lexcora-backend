const express = require('express');
const router  = express.Router();
const c = require('../controllers/employeeRequestsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkPermission }   = require('../middlewares/permissionsMiddleware');

// ── Public (authenticated) reads ─────────────────────────────────
router.get('/',                        authenticateToken, c.getEmployeeRequests);
router.get('/finance-summary',         authenticateToken, c.getFinanceSummary);
router.get('/employee/:employeeId',    authenticateToken, c.getRequestsByEmployeeId);
router.get('/:id',                     authenticateToken, c.getEmployeeRequest);

// ── Create / update basic request fields ─────────────────────────
router.post('/',                       authenticateToken, c.createEmployeeRequest);
router.put('/:id',                     authenticateToken, c.updateEmployeeRequest);

// ── Approval workflow ─────────────────────────────────────────────
// Manager approval — any authenticated user with the general permission
router.patch('/:id/manager-approval',  authenticateToken, c.updateManagerApproval);

// HR approval — HR department
router.patch('/:id/hr-approval',       authenticateToken, c.updateHrApproval);

// Finance approval — requires explicit Finance permission (checked inside controller)
router.patch('/:id/finance-approval',  authenticateToken, c.updateFinanceApproval);

// ── Financial values — gated inside controller ────────────────────
router.patch('/:id/financial-values',  authenticateToken, c.updateLeaveFinancialValues);

// ── Delete ────────────────────────────────────────────────────────
router.delete('/:id',                  authenticateToken, c.deleteEmployeeRequest);

module.exports = router;

