const express = require('express');
const router = express.Router();
const employeeExpensesController = require('../controllers/employeeExpensesController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all expenses
router.get('/', authenticateToken, employeeExpensesController.getAllExpenses);

// Get expense by id
router.get('/:id', authenticateToken, employeeExpensesController.getExpenseById);

// Create new expense
router.post('/', authenticateToken, employeeExpensesController.createExpense);

// Update expense
router.put('/:id', authenticateToken, employeeExpensesController.updateExpense);

// Delete expense
router.delete('/:id', authenticateToken, employeeExpensesController.deleteExpense);

module.exports = router;
