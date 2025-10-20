// executionsRoute.js
// Routes for executions

const express = require('express');
const router = express.Router();
const executionsController = require('../controllers/executionsController');

// Get all executions
router.get('/', executionsController.getAllExecutions);

// Get execution by ID
router.get('/:id', executionsController.getExecutionById);

// Get executions by case ID
router.get('/case/:caseId', executionsController.getExecutionsByCaseId);

// Get executions by date
router.get('/date/:date', executionsController.getExecutionsByDate);

// Get executions by type
router.get('/type/:type', executionsController.getExecutionsByType);

// Get executions by status
router.get('/status/:status', executionsController.getExecutionsByStatus);

// Get executions by amount range
router.get('/amount-range/:minAmount/:maxAmount', executionsController.getExecutionsByAmountRange);

// Create a new execution
router.post('/', executionsController.createExecution);

// Update an execution by ID
router.put('/:id', executionsController.updateExecution);

// Delete an execution by ID
router.delete('/:id', executionsController.deleteExecution);

// Delete an execution document by ID
router.delete('/documents/:id', executionsController.deleteExecutionDocument);

module.exports = router;