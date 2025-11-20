// tasksRoute.js
// Routes for tasks

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { check } = require('express-validator');
const { checkPermission } = require('../middlewares/permissionsMiddleware');
const { paginationValidator, sortValidator } = require('../middlewares/validators');

// Get all tasks
router.get(
  '/',
  authenticateToken,
  paginationValidator,
  sortValidator(['due_date', 'created_at', 'id', 'priority']),
  tasksController.getAllTasks
);

// Get task by ID
router.get('/:id', authenticateToken, tasksController.getTaskById);

// Get tasks by employee ID
router.get('/employee/:employeeId', authenticateToken, tasksController.getTasksByEmployeeId);

// Get tasks assigned to an employee
router.get('/assigned-to/:employeeId', authenticateToken, tasksController.getAssignedToTasks);

// Get tasks by case ID
router.get('/case/:caseId', authenticateToken, tasksController.getTasksByCaseId);

// Get case tasks with employee details
router.get('/case-tasks/:caseId', authenticateToken, tasksController.getCaseTasks);

// Get tasks created by an employee (filtered by status)
router.get('/creator/:employeeId', authenticateToken, tasksController.getCreatorTasks);

// Create a new task
router.post('/', authenticateToken, checkPermission('Add Task'), tasksController.createTask);

// Update a task by ID
router.put('/:id', authenticateToken, checkPermission('Edit Task'), tasksController.updateTask);

// Delete a task by ID
router.delete('/:id', authenticateToken, checkPermission('Delete Task'), tasksController.deleteTask);

// Delete a task document by ID
router.delete('/documents/:id', authenticateToken, tasksController.deleteTaskDocument);

// Delete a task comment by ID
router.delete('/comments/:id', authenticateToken, tasksController.deleteTaskComment);

// Add a comment to a task
router.post('/:taskId/comments', authenticateToken, tasksController.addCommentToTask);

module.exports = router;
