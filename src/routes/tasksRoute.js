// tasksRoute.js
// Routes for tasks

const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all tasks
router.get('/',   tasksController.getAllTasks);

// Get task by ID
router.get('/:id',   tasksController.getTaskById);

// Get tasks by employee ID
router.get('/employee/:employeeId',   tasksController.getTasksByEmployeeId);

// Get tasks assigned to an employee
router.get('/assigned-to/:employeeId',   tasksController.getAssignedToTasks);

// Get tasks by case ID
router.get('/case/:caseId',   tasksController.getTasksByCaseId);

// Get case tasks with employee details
router.get('/case-tasks/:caseId',   tasksController.getCaseTasks);

// Get tasks created by an employee (filtered by status)
router.get('/creator/:employeeId',   tasksController.getCreatorTasks);

// Create a new task
router.post('/', authenticateToken, tasksController.createTask);

// Update a task by ID
router.put('/:id', authenticateToken, tasksController.updateTask);

// Delete a task by ID
router.delete('/:id', authenticateToken, tasksController.deleteTask);

// Delete a task document by ID
router.delete('/documents/:id', authenticateToken, tasksController.deleteTaskDocument);

// Delete a task comment by ID
router.delete('/comments/:id', authenticateToken, tasksController.deleteTaskComment);

// Add a comment to a task
router.post('/:taskId/comments', authenticateToken, tasksController.addCommentToTask);

module.exports = router;