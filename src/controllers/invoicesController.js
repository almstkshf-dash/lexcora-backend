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
    
    // Import required modules for S3 upload
    const { PutObjectCommand } = require('@aws-sdk/client-s3');
    const path = require('path');

    const s3Client = require('../config/s3Client');

    const folder = 'invoices-attachments';
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const usePublicUrl = process.env.AWS_S3_USE_PUBLIC_URL === 'true';
    const publicUrl = process.env.AWS_S3_PUBLIC_URL;

    // Upload all files to S3 first
    const uploadPromises = req.files.map(async (file) => {
      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${fileExtension}`;
      const key = `${folder}/${filename}`;

      // Upload to S3
      const putCommand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(putCommand);

      // Generate file URL - prioritize public URL
      let fileUrl;
      if (usePublicUrl && publicUrl) {
        // Use public URL - no expiration
        fileUrl = `${publicUrl}/${key}`;
      } else {
        // Use pre-signed URL - expires in 7 days
        const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
        const { GetObjectCommand } = require('@aws-sdk/client-s3');
        const getCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        });
        fileUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 }); // 7 days
        console.log('Generated pre-signed URL:', fileUrl.substring(0, 100) + '...'); // Log first 100 chars
      }

      console.log(`File uploaded: ${file.originalname}, URL length: ${fileUrl.length}`);

      return {
        attachment_name: file.originalname,
        attachment_url: fileUrl,
        s3_key: key, // Store key for future URL regeneration if needed
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
