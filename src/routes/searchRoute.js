const express = require('express');
const router = express.Router();
const semanticSearchController = require('../controllers/semanticSearchController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/semantic', authenticateToken, semanticSearchController.search);

module.exports = router;

