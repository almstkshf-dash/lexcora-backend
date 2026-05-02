const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  updateTemplate,
  getSettings,
  updateSettings,
  sendMessage
} = require('../controllers/clientMessagesController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Template routes
router.get('/', authenticateToken, getTemplates);
router.get('/settings', authenticateToken, getSettings);
router.put('/settings', authenticateToken, updateSettings);
router.post('/send', authenticateToken, sendMessage);
router.get('/:type', authenticateToken, getTemplate);
router.put('/:type', authenticateToken, updateTemplate);

module.exports = router;
