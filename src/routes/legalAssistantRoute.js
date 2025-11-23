const express = require('express');
const router = express.Router();
const legalAssistantController = require('../controllers/legalAssistantController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validators');

const chatValidators = [
  body('message').isString().trim().notEmpty().withMessage('message is required'),
  body('context')
    .optional()
    .custom((val) => val === null || typeof val === 'object')
    .withMessage('context must be an object'),
  body('context.caseId').optional().isString().trim(),
  body('context.caseSummary').optional().custom((val) => typeof val === 'string' || typeof val === 'object')
    .withMessage('caseSummary must be a string or object'),
  body('context.sessions').optional().isArray().withMessage('sessions must be an array'),
  body('context.memos').optional().isArray().withMessage('memos must be an array'),
  body('context.petitions').optional().isArray().withMessage('petitions must be an array'),
  body('context.deadlines').optional().isArray().withMessage('deadlines must be an array'),
  body('context.fetchedAt').optional().isISO8601().withMessage('fetchedAt must be a valid date'),
  body('attachments').optional().isArray().withMessage('attachments must be an array'),
  body('attachments.*.document_name').optional().isString().trim(),
  body('attachments.*.document_url').optional().isURL().withMessage('document_url must be a valid URL'),
  body('attachments.*.page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  body('attachments.*.chunk').optional().isString().trim(),
  body('attachments.*.snippet').optional().isString(),
  body('history').optional().custom((value) => Array.isArray(value) || (typeof value === 'object' && value !== null))
    .withMessage('history must be an array or keyed object'),
  handleValidationErrors
];

/**
 * @route   POST /api/legal-assistant
 * @desc    Chat with the legal assistant
 * @access  Protected (requires authentication)
 */
router.post('/', authenticateToken, chatValidators, legalAssistantController.chat);
router.get('/history/:caseId', authenticateToken, checkPermission('View Case'), legalAssistantController.getHistory);
router.post('/stream', authenticateToken, chatValidators, legalAssistantController.streamChat);

module.exports = router;
