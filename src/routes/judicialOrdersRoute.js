// judicialOrdersRoute.js
// Routes for judicial orders

const express = require('express');
const router = express.Router();
const judicialOrdersController = require('../controllers/judicialOrdersController');

// Get all judicial orders
router.get('/', judicialOrdersController.getAllJudicialOrders);

// Get judicial order by ID
router.get('/:id', judicialOrdersController.getJudicialOrderById);

// Get judicial orders by case ID
router.get('/case/:caseId', judicialOrdersController.getJudicialOrdersByCaseId);

// Get judicial orders by authentication date
router.get('/authentication-date/:authenticationDate', judicialOrdersController.getJudicialOrdersByAuthenticationDate);

// Get judicial orders by notification period
router.get('/notification-period/:notificationPeriodDays', judicialOrdersController.getJudicialOrdersByNotificationPeriod);

// Create a new judicial order
router.post('/', judicialOrdersController.createJudicialOrder);

// Update a judicial order by ID
router.put('/:id', judicialOrdersController.updateJudicialOrder);

// Delete a judicial order by ID
router.delete('/:id', judicialOrdersController.deleteJudicialOrder);

// Delete a judicial order document by ID
router.delete('/documents/:id', judicialOrdersController.deleteJudicialOrderDocument);

module.exports = router;