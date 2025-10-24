const invoicesModel = require('../models/invoicesModel');

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

const createInvoice = async (invoiceData) => {
  const { items, ...invoice } = invoiceData;
  return await invoicesModel.createInvoice(invoice, items || []);
};

const updateInvoice = async (id, invoiceData) => {
  const { items, ...invoice } = invoiceData;
  return await invoicesModel.updateInvoice(id, invoice, items);
};

const deleteInvoice = async (id) => {
  return await invoicesModel.deleteInvoice(id);
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  createInvoice,
  updateInvoice,
  deleteInvoice
};
