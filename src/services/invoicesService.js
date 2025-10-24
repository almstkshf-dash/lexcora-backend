const invoicesModel = require('../models/invoicesModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllInvoices = async () => {
  try {
    return await invoicesModel.getAllInvoices();
  } catch (error) {
    console.error('Error fetching all invoices:', error);
    throw error;
  }
};

const getInvoiceById = async (id) => {
  return await invoicesModel.getInvoiceById(id);
};

const getInvoicesByClientId = async (clientId) => {
  return await invoicesModel.getInvoicesByClientId(clientId);
};

const createInvoice = async (invoiceData, createdBy = null) => {
  const { items, ...invoice } = invoiceData;
  const result = await invoicesModel.createInvoice(invoice, items || []);
  
  // Log invoice creation
  if (createdBy && result.success) {
    await logAdd(
      createdBy,
      'فاتورة',
      `فاتورة رقم ${invoice.invoice_number || 'جديدة'}`,
      result.data?.id
    );
  }
  
  return result;
};

const updateInvoice = async (id, invoiceData, updatedBy = null) => {
  const { items, ...invoice } = invoiceData;
  const result = await invoicesModel.updateInvoice(id, invoice, items);
  
  // Log invoice update
  if (updatedBy && result.success) {
    await logUpdate(
      updatedBy,
      'فاتورة',
      `فاتورة رقم ${invoice.invoice_number || id}`,
      id
    );
  }
  
  return result;
};

const deleteInvoice = async (id, deletedBy = null) => {
  // Get invoice details before deletion
  let invoice = null;
  if (deletedBy) {
    try {
      const invoiceResult = await invoicesModel.getInvoiceById(id);
      if (invoiceResult.success) {
        invoice = invoiceResult.data;
      }
    } catch (error) {
      console.error('Error getting invoice:', error);
    }
  }
  
  const result = await invoicesModel.deleteInvoice(id);
  
  // Log invoice deletion
  if (deletedBy && result.success && invoice) {
    await logDelete(
      deletedBy,
      'فاتورة',
      `فاتورة رقم ${invoice.invoice_number || id}`,
      id
    );
  }
  
  return result;
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
