const express = require('express');
const router = express.Router();
const externalLinksController = require('../controllers/externalLinksController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all external links
router.get('/', authenticateToken, externalLinksController.getAllExternalLinks);

// Create a new external link
router.post('/', authenticateToken, externalLinksController.createExternalLink);

// Delete an external link
router.delete('/:id', authenticateToken, externalLinksController.deleteExternalLink);

module.exports = router;
