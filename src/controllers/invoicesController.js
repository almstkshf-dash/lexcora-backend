// invoicesController.js
// Controller functions for invoices

const invoicesService = require('../services/invoicesService');

const getAllInvoices = async (req, res) => {
  try {
    const result = await invoicesService.getAllInvoices();
    res.json(result);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoices' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const result = await invoicesService.getInvoiceById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch invoice' });
  }
};

const getInvoicesByClientId = async (req, res) => {
  try {
    const result = await invoicesService.getInvoicesByClientId(req.params.clientId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching client invoices:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client invoices' });
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
      return res.status(400).json({ 
        success: false, 
        error: 'Invoice date is required' 
      });
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be greater than zero' 
      });
    }

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one invoice item is required' 
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || req.userId || null;
    
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
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to create invoice' });
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
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
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
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to update invoice' });
  }
};

const deleteInvoice = async (req, res) => {
  try {
    // Get deleted_by from authenticated user
    const deleted_by = req.user?.id || req.userId || null;
    
    const result = await invoicesService.deleteInvoice(req.params.id, deleted_by);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to delete invoice' });
  }
};

const deleteInvoiceAttachment = async (req, res) => {
  try {
    const result = await invoicesService.deleteInvoiceAttachment(req.params.attachmentId);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting invoice attachment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete attachment' });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        error: 'Status is required' 
      });
    }
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await invoicesService.updateInvoice(req.params.id, { status }, updated_by);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ success: false, error: 'Failed to update invoice status' });
  }
};

const uploadInvoiceAttachments = async (req, res) => {
  try {
    const invoiceId = req.params.id;
    
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided',
      });
    }
    
    // Import required modules for Vercel Blob upload
    const { uploadToBlob } = require('../utils/blobStorage');
    const path = require('path');

    const folder = 'invoices-attachments';

    // Upload all files to Vercel Blob
    const uploadPromises = req.files.map(async (file) => {
      // Generate unique path/filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const fileExtension = path.extname(file.originalname);
      const filename = `${path.basename(file.originalname, fileExtension)}-${timestamp}-${randomString}${fileExtension}`;
      const blobPath = `${folder}/${filename}`;

      // Upload to Vercel Blob
      const blob = await uploadToBlob(blobPath, file.buffer, file.mimetype);

      console.log(`File uploaded to Vercel Blob: ${file.originalname}, URL: ${blob.url}`);

      return {
        attachment_name: file.originalname,
        attachment_url: blob.url,
        s3_key: blob.url, // Store full URL as key for easier deletion
      };
    });

    const attachments = await Promise.all(uploadPromises);
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || req.userId || null;
    
    // Save attachments to database
    const result = await invoicesService.uploadInvoiceAttachments(invoiceId, attachments, created_by);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error uploading invoice attachments:', error);
    res.status(500).json({ success: false, error: 'Failed to upload attachments' });
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
