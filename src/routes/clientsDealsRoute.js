const express = require('express');
const router = express.Router();
const clientsDealsController = require('../controllers/clientsDealsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all clients deals with pagination and filters
router.get('/', clientsDealsController.getAllClientsDeals);

// Get deals by client ID
router.get('/client/:clientId', clientsDealsController.getClientDealsByClientId);

// Get a specific client deal by ID
router.get('/:id', authenticateToken, clientsDealsController.getClientDealById);

// Create a new client deal (no file upload needed - files are uploaded separately via /upload endpoint)
router.post('/', clientsDealsController.createClientDeal);

// Update a client deal (no file upload needed - files are uploaded separately via /upload endpoint)
router.put('/:id', clientsDealsController.updateClientDeal);

// Delete a client deal
router.delete('/:id', clientsDealsController.deleteClientDeal);

// Delete a specific document from a deal
router.delete('/:id/documents/:documentId', authenticateToken, clientsDealsController.deleteDealDocument);

module.exports = router;