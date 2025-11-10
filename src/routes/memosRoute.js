// memosRoute.js
// Routes for memos

const express = require('express');
const router = express.Router();
const memosController = require('../controllers/memosController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');

// Get all memos
router.get('/', authenticateToken, memosController.getAllMemos);

// Get memos by status
router.get('/status/:status', authenticateToken, memosController.getMemosByStatus);

// Get memos pending approval
router.get('/pending-approval', authenticateToken, memosController.getMemosPendingApproval);

// Get active memos (not approved or rejected)
router.get('/active', memosController.getActiveMemos);

// Get active memos by employee ID
router.get('/employee/:employeeId/active', memosController.getActiveEmployeeMemos);

// Get memo by ID
router.get('/:id', memosController.getMemoById);

// Get memos by case ID
router.get('/case/:caseId', memosController.getMemosByCaseId);

// Get memo approval status
router.get('/:id/approval-status', memosController.getMemoApprovalStatus);

// Create a new memo
router.post('/', authenticateToken, checkPermission('Add Memo'), memosController.addMemo);

// Update memo
router.put('/:id', authenticateToken, checkPermission('Edit Memo'), memosController.updateMemo);

// Submit memo for approval (change status from Draft to Pending Approval)
router.patch('/:id/submit-for-approval', authenticateToken, memosController.submitMemoForApproval);

// Approve/disapprove memo by specific role
// Body should contain: { "approvalType": "lawyer|secretary|consultant|admin", "isApproved": true|false }
router.patch('/:id/approve', authenticateToken, memosController.approveMemo);

// Update memo status
// Body should contain: { "status": "Draft|Pending Approval|Approved|Submitted to Court|Rejected", "adminNote": "optional note" }
router.patch('/:id/status', authenticateToken, memosController.updateMemoStatus);

// Update employee memo status (for specific employee position)
// Body should contain: { "status": "Pending|Approved|Rejected", "position": "lawyer|secretary|consultant|admin" }
router.patch('/:id/employee-status', authenticateToken, memosController.updateEmployeeMemoStatus);

// Delete memo
router.delete('/:id', authenticateToken, checkPermission('Delete Memo'), memosController.deleteMemo);

module.exports = router;