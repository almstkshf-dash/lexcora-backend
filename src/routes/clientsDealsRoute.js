const express = require('express');
const router = express.Router();
const clientsDealsController = require('../controllers/clientsDealsController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { check } = require('express-validator');
const { checkPermission } = require('../middlewares/permissionsMiddleware');

// Get all clients deals with pagination and filters
router.get('/', authenticateToken, checkPermission('View  Deals'), clientsDealsController.getAllClientsDeals);

// Get deals by client ID
router.get('/client/:clientId', authenticateToken, checkPermission('View Clients Deals'), clientsDealsController.getClientDealsByClientId);

// Get a specific client deal by ID
router.get('/:id', authenticateToken, checkPermission('View Deal'), clientsDealsController.getClientDealById);

// Create a new client deal (no file upload needed - files are uploaded separately via /upload endpoint)
router.post('/', authenticateToken, checkPermission('Add Deal'), clientsDealsController.createClientDeal);

// Update a client deal (no file upload needed - files are uploaded separately via /upload endpoint)
router.put('/:id', authenticateToken, checkPermission('Edit Deal'), clientsDealsController.updateClientDeal);

// Delete a client deal
router.delete('/:id', authenticateToken, checkPermission('Delete Deal'), clientsDealsController.deleteClientDeal);

// Delete a specific document from a deal
router.delete('/:id/documents/:documentId', authenticateToken, clientsDealsController.deleteDealDocument);

module.exports = router;