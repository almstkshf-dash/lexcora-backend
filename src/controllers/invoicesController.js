// invoicesController.js
// Controller functions for invoices

const invoicesService = require('../services/invoicesService');

const getAllInvoices = async (req, res) => {
  try {
    const result = await invoicesService.getAllInvoices();
    res.list(result.data || result);
  } catch (error) {
    console.error('[GET_ALL_INVOICES_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedFetchInvoices'), 500, 'INVOICES_LIST_ERROR');
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const result = await invoicesService.getInvoiceById(req.params.id);
    if (!result.success) {
      return res.fail(req.t('finance.invoiceNotFound'), 404, 'INVOICE_NOT_FOUND');
    }
    res.success(result.data);
  } catch (error) {
    console.error('[GET_INVOICE_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedFetchInvoice'), 500, 'INVOICE_GET_ERROR');
  }
};

const getInvoicesByClientId = async (req, res) => {
  try {
    const result = await invoicesService.getInvoicesByClientId(req.params.clientId);
    res.list(result.data || result);
  } catch (error) {
    console.error('[GET_CLIENT_INVOICES_ERROR]', { clientId: req.params.clientId, message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedFetchClientInvoices'), 500, 'CLIENT_INVOICES_ERROR');
  }
};

const createInvoice = async (req, res) => {
  try {
    const { 
      invoice_date,
      invoice_number,
      amount,
      client_id,
      branch_id,
      bank_account_id,
      status,
      vat,
      currency,
      items,
      attachments
    } = req.body;
    
    // Validate required fields
    if (!invoice_date) {
      return res.fail(req.t('finance.invoiceDateRequired'), 400, 'VALIDATION_ERROR');
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      return res.fail(req.t('finance.amountGreaterThanZero'), 400, 'VALIDATION_ERROR');
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.fail(req.t('finance.atLeastOneItemRequired'), 400, 'VALIDATION_ERROR');
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || null;
    
    const result = await invoicesService.createInvoice({ 
      invoice_date,
      invoice_number,
      amount,
      client_id: client_id || null,
      branch_id: branch_id || null,
      bank_account_id: bank_account_id || null,
      status: status || 'pending',
      vat: vat || 0,
      currency: currency || 'AED',
      items,
      attachments: attachments || [],
      created_by 
    }, created_by);
    
    if (!result.success) {
      return res.fail(result.error || req.t('finance.failedCreateInvoice'), 400, 'INVOICE_CREATE_INVALID');
    }
    
    res.created(result.data, req.t('finance.invoiceCreated'));
  } catch (error) {
    console.error('[CREATE_INVOICE_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('finance.failedCreateInvoice'), 500, 'INVOICE_CREATE_ERROR');
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { 
      invoice_date,
      amount,
      client_id,
      branch_id,
      bank_account_id,
      status,
      vat,
      currency,
      items,
      attachments
    } = req.body;
    
    const updated_by = req.user?.id || null;
    
    const result = await invoicesService.updateInvoice(req.params.id, { 
      invoice_date,
      amount,
      client_id,
      branch_id,
      bank_account_id,
      status,
      vat,
      currency,
      items,
      attachments
    }, updated_by);
    
    if (!result.success) {
      return res.fail(req.t('finance.invoiceNotFound'), 404, 'INVOICE_NOT_FOUND');
    }
    
    res.success(result.data, req.t('finance.invoiceUpdated'));
  } catch (error) {
    console.error('[UPDATE_INVOICE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('finance.failedUpdateInvoice'), 500, 'INVOICE_UPDATE_ERROR');
  }
};

const deleteInvoice = async (req, res) => {
  try {
    const deleted_by = req.user?.id || null;
    
    const result = await invoicesService.deleteInvoice(req.params.id, deleted_by);
    
    if (!result.success) {
      return res.fail(req.t('finance.invoiceNotFound'), 404, 'INVOICE_NOT_FOUND');
    }
    
    res.success(null, req.t('finance.invoiceDeleted'));
  } catch (error) {
    console.error('[DELETE_INVOICE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedDeleteInvoice'), 500, 'INVOICE_DELETE_ERROR');
  }
};

const deleteInvoiceAttachment = async (req, res) => {
  try {
    const result = await invoicesService.deleteInvoiceAttachment(req.params.attachmentId);
    
    if (!result.success) {
      return res.fail(req.t('finance.attachmentNotFound'), 404, 'ATTACHMENT_NOT_FOUND');
    }
    
    res.success(null, req.t('finance.attachmentDeleted'));
  } catch (error) {
    console.error('[DELETE_INVOICE_ATTACHMENT_ERROR]', { id: req.params.attachmentId, message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedDeleteAttachment'), 500, 'ATTACHMENT_DELETE_ERROR');
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.fail(req.t('finance.statusRequired'), 400, 'VALIDATION_ERROR');
    }
    
    const updated_by = req.user?.id || null;
    
    const result = await invoicesService.updateInvoice(req.params.id, { status }, updated_by);
    
    if (!result.success) {
      return res.fail(req.t('finance.invoiceNotFound'), 404, 'INVOICE_NOT_FOUND');
    }
    
    res.success(result.data, req.t('finance.invoiceStatusUpdated'));
  } catch (error) {
    console.error('[UPDATE_INVOICE_STATUS_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('finance.failedUpdateInvoiceStatus'), 500, 'INVOICE_STATUS_ERROR');
  }
};

const uploadInvoiceAttachments = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    
    if (!req.files || req.files.length === 0) {
      return res.fail(req.t('finance.noFilesProvided'), 400, 'VALIDATION_ERROR');
    }
    
    const { uploadToBlob } = require('../utils/blobStorage');
    const path = require('path');

    const folder = 'invoices-attachments';

    const uploadPromises = req.files.map(async (file) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = path.extname(file.originalname);
      const filename = `${path.basename(file.originalname, fileExtension)}-${timestamp}-${randomString}${fileExtension}`;
      const blobPath = `${folder}/${filename}`;

      const blob = await uploadToBlob(blobPath, file.buffer, file.mimetype);
      return {
        attachment_name: file.originalname,
        attachment_url: blob.url,
        s3_key: blob.url,
      };
    });

    const attachments = await Promise.all(uploadPromises);
    const created_by = req.user?.id || null;
    
    const result = await invoicesService.uploadInvoiceAttachments(invoiceId, attachments, created_by);
    
    if (!result.success) {
      return res.fail(result.error || req.t('finance.failedUploadAttachments'), 400, 'UPLOAD_INVALID');
    }
    
    res.success(result.data, req.t('finance.attachmentsUploaded'));
  } catch (error) {
    console.error('[UPLOAD_INVOICE_ATTACHMENTS_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedUploadAttachments'), 500, 'UPLOAD_ERROR');
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  createInvoice,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  deleteInvoiceAttachment,
  uploadInvoiceAttachments
};
