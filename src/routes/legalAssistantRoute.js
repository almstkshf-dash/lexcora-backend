const express = require('express');
const router = express.Router();
const legalAssistantController = require('../controllers/legalAssistantController');
const { authenticateToken } = require('../middliewares/authMiddleware');

/**
 * @route   POST /api/legal-assistant
 * @desc    Chat with the legal assistant
 * @access  Protected (requires authentication)
 */
router.post('/', authenticateToken, legalAssistantController.chat);

module.exports = router;
