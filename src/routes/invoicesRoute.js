const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoicesController');
const { upload } = require('../controllers/uploadController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { 
  idValidator,
  clientIdValidator
} = require('../middlewares/validators');
const { checkPermission } = require('../middlewares/permissionsMiddleware');

// Get all invoices
router.get('/', authenticateToken, checkPermission('view_invoices') , invoicesController.getAllInvoices);

// Get invoice by id
router.get('/:id', authenticateToken, idValidator, invoicesController.getInvoiceById);

// Get invoices by client id
router.get('/client/:clientId', authenticateToken, clientIdValidator, invoicesController.getInvoicesByClientId);

// Create new invoice
router.post('/', authenticateToken, checkPermission('invoice_add'), invoicesController.createInvoice);

// Update invoice
router.put('/:id', authenticateToken, checkPermission('invoice_edit'), idValidator, invoicesController.updateInvoice);

// Update invoice status
router.patch('/:id/status', authenticateToken, idValidator, invoicesController.updateInvoiceStatus);

// Delete invoice
router.delete('/:id', authenticateToken, checkPermission('invoice_delete'), idValidator, invoicesController.deleteInvoice);

// Upload invoice attachments
router.post('/:id/attachments', authenticateToken, idValidator, upload.array('files', 10), invoicesController.uploadInvoiceAttachments);

// Delete invoice attachment
router.delete('/attachments/:attachmentId', authenticateToken, invoicesController.deleteInvoiceAttachment);

module.exports = router;

