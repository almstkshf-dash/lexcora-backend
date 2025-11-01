const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoicesController');
const { authenticateToken } = require('../middliewares/authMiddleware');
const { 
  idValidator,
  clientIdValidator
} = require('../middlewares/validators');

// Get all invoices
router.get('/', authenticateToken, invoicesController.getAllInvoices);

// Get invoice by id
router.get('/:id', authenticateToken, idValidator, invoicesController.getInvoiceById);

// Get invoices by client id
router.get('/client/:clientId', authenticateToken, clientIdValidator, invoicesController.getInvoicesByClientId);

// Create new invoice
router.post('/', authenticateToken, invoicesController.createInvoice);

// Update invoice
router.put('/:id', authenticateToken, idValidator, invoicesController.updateInvoice);

// Delete invoice
router.delete('/:id', authenticateToken, idValidator, invoicesController.deleteInvoice);

// Delete invoice attachment
router.delete('/attachments/:attachmentId', authenticateToken, invoicesController.deleteInvoiceAttachment);

module.exports = router;
