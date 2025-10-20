const express = require('express');
const router = express.Router();
const employeeRequestsController = require('../controllers/employeeRequestsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, employeeRequestsController.getEmployeeRequests);
router.get('/employee/:employeeId', authenticateToken, employeeRequestsController.getRequestsByEmployeeId);
router.get('/:id', authenticateToken, employeeRequestsController.getEmployeeRequest);
router.post('/', authenticateToken, employeeRequestsController.createEmployeeRequest);
router.put('/:id', authenticateToken, employeeRequestsController.updateEmployeeRequest);
router.patch('/:id/manager-approval', authenticateToken, employeeRequestsController.updateManagerApproval);
router.patch('/:id/hr-approval', authenticateToken, employeeRequestsController.updateHrApproval);
router.delete('/:id', authenticateToken, employeeRequestsController.deleteEmployeeRequest);

module.exports = router;
