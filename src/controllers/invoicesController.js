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
      referred_by_employee_id,
      bank_account_id,
      status,
      items
    } = req.body;
    
    // Validate required fields
    if (!invoice_date || !bank_account_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invoice date and bank account are required' 
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
      referred_by_employee_id: referred_by_employee_id || null,
      bank_account_id,
      status: status || 'draft',
      items,
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
      referred_by_employee_id,
      bank_account_id,
      status,
      items
    } = req.body;
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await invoicesService.updateInvoice(req.params.id, { 
      invoice_date,
      amount,
      client_id,
      referred_by_employee_id,
      bank_account_id,
      status,
      items
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

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
