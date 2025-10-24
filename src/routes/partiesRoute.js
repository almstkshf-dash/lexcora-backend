const express = require('express');
const router = express.Router();
const partiesController = require('../controllers/partiesController');
const { authenticateToken } = require('../middliewares/authMiddleware');


// Get all parties
router.get('/', partiesController.getAllParties);

// Check for duplicate party (before creating)
router.get('/check-duplicate', partiesController.checkDuplicateParty);

// Search parties by name or phone (for combobox)
router.get('/search', partiesController.searchParties);

// Get potential clients (parties that are not client or opponent)
router.get('/potential-clients', partiesController.getPotentialClients);

// Get parties by branch ID
router.get('/branch/:branchId', partiesController.getPartiesByBranchId);

// Create a new party
router.post('/',authenticateToken, partiesController.createParty);

router.delete('/:id',authenticateToken, partiesController.deleteParty);
router.get('/:id', authenticateToken, partiesController.getPartyById);
router.put('/:id',authenticateToken, partiesController.updateParty);

// Get all cases for a specific party
router.get('/:id/cases', partiesController.getPartyCases);

module.exports = router;
