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

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  deleteInvoiceAttachment
};
