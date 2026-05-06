const express = require('express');
const router = express.Router();
const warningsController = require('../controllers/warningsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, warningsController.getWarnings);
router.get('/:id', authenticateToken, warningsController.getWarning);
router.get('/:id/documents', authenticateToken, warningsController.getWarningDocuments);
router.post('/', authenticateToken, warningsController.createWarning);
router.put('/:id', authenticateToken, warningsController.updateWarning);
router.delete('/:warningId/documents/:documentId', authenticateToken, warningsController.deleteWarningDocument);
router.delete('/:id', authenticateToken, warningsController.deleteWarning);

module.exports = router;

