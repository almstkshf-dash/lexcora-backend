const express = require('express');
const router = express.Router();
const { upload, uploadFiles, getPresignedUrl, deleteFile, deleteFiles } = require('../controllers/uploadController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Upload multiple files
router.post('/', authenticateToken, upload.array('files', 10), uploadFiles);

// Get presigned URL for existing file
router.post('/presigned-url', authenticateToken, getPresignedUrl);

// Delete a single file
router.delete('/', authenticateToken, deleteFile);

// Delete multiple files
router.delete('/batch', authenticateToken, deleteFiles);

module.exports = router;
