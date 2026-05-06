const express = require('express');
const router = express.Router();
const clientAuthController = require('../controllers/clientAuthController');
const clientCasesController = require('../controllers/clientCasesController');
const { authenticateClientToken } = require('../middlewares/clientAuthMiddleware');

// Client login
router.post('/login', clientAuthController.loginClient);

// Client logout
router.post('/logout', authenticateClientToken, clientAuthController.logoutClient);

// Get current client profile
router.get('/me', authenticateClientToken, clientAuthController.getCurrentClient);

// Get client documents
router.get('/documents', authenticateClientToken, clientAuthController.getClientDocuments);

// Get client requests
router.get('/requests', authenticateClientToken, clientAuthController.getClientRequests);

// Create client request
router.post('/requests', authenticateClientToken, clientAuthController.createClientRequest);

// Get client cases
router.get('/cases', authenticateClientToken, clientCasesController.getClientCases);

// Get client case by ID
router.get('/cases/:id', authenticateClientToken, clientCasesController.getClientCaseById);

// Finance routes
router.get('/finance-summary', authenticateClientToken, clientAuthController.getClientFinanceSummary);
router.get('/invoices', authenticateClientToken, clientAuthController.getClientInvoices);

module.exports = router;

