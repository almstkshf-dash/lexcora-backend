const express = require('express');
const router = express.Router();
const clientsAgreementsController = require('../controllers/clientsAgreementsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Get all clients agreements with pagination and filters
router.get('/', authenticateToken, clientsAgreementsController.getAllClientsAgreements);

// Get a specific client agreement by ID
router.get('/:id', authenticateToken, clientsAgreementsController.getClientAgreementById);

// Create a new client agreement
router.post('/', authenticateToken, clientsAgreementsController.createClientAgreement);

// Update a client agreement
router.put('/:id', authenticateToken, clientsAgreementsController.updateClientAgreement);

// Delete a client agreement
router.delete('/:id', authenticateToken, clientsAgreementsController.deleteClientAgreement);

module.exports = router;

