const express = require('express');
const router = express.Router();
const partiesController = require('../controllers/partiesController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { check } = require('express-validator');
const { checkPermission } = require('../middlewares/permissionsMiddleware');


// Get all parties
router.get('/', authenticateToken, checkPermission('View Parties'), partiesController.getAllParties);

// Check for duplicate party (before creating)
router.get('/check-duplicate', authenticateToken, partiesController.checkDuplicateParty);

// Search parties by name or phone (for combobox)
router.get('/search', authenticateToken, partiesController.searchParties);

// Get potential clients (parties that are not client or opponent)
router.get('/potential-clients', authenticateToken, checkPermission('View Parties'), partiesController.getPotentialClients);

// Get finance clients (parties where party_type != 'opponent')
router.get('/finance-clients', authenticateToken, partiesController.getClientsForFinance);

// Get parties by branch ID
router.get('/branch/:branchId', authenticateToken, partiesController.getPartiesByBranchId);

// Create a new party
router.post('/', authenticateToken, checkPermission('Add Party'), partiesController.createParty);

router.delete('/:id', authenticateToken, checkPermission('Delete Party'), partiesController.deleteParty);
router.get('/:id', authenticateToken, checkPermission('View Party'), partiesController.getPartyById);
router.put('/:id', authenticateToken, checkPermission('Edit Party'), partiesController.updateParty);

// Get all cases for a specific party
router.get('/:id/cases', authenticateToken,  partiesController.getPartyCases);

module.exports = router;
