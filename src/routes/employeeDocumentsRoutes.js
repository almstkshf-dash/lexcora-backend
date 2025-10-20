const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  getEmployeeDocuments,
  getEmployeeDocumentsByType,
  getDocumentCountByType,
  deleteDocument,
} = require('../controllers/employeeDocumentsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Upload document (file already uploaded, just save metadata)
router.post('/upload', uploadDocument);

// Get all documents for an employee
router.get('/employee/:employeeId', getEmployeeDocuments);

// Get documents by type for an employee
router.get('/employee/:employeeId/type/:type', getEmployeeDocumentsByType);

// Get document count by type for an employee
router.get('/employee/:employeeId/counts', getDocumentCountByType);

// Delete a document
router.delete('/:id', deleteDocument);

module.exports = router;
