const express = require('express');
const router = express.Router();
const legalAssistantController = require('../controllers/legalAssistantController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validators');

const chatValidators = [
  body('message').isString().trim().notEmpty().withMessage('message is required'),
  handleValidationErrors
];

/**
 * @route   POST /api/legal-assistant
 * @desc    Chat with the legal assistant
 * @access  Protected (requires authentication)
 */
router.post('/', authenticateToken, chatValidators, legalAssistantController.chat);

module.exports = router;
