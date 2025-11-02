const invoicesModel = require('../models/invoicesModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');
const { sendNotification } = require('../utils/notificationHelper');
const db = require('../config/db');

// Helper function to get all admin user IDs
const getAdminIds = async () => {
  try {
    const [rows] = await db.query(`
      SELECT e.id 
      FROM employees e
      LEFT JOIN roles r ON e.role_id = r.id
      WHERE r.role_en = 'admin'
    `);
    return rows.map(row => row.id);
  } catch (error) {
    console.error('Error fetching admin IDs:', error);
    return [];
  }
};

// Helper function to send notifications to admins for invoice actions
const sendInvoiceNotificationsToAdmins = async (invoiceNumber, amount, action, createdBy) => {
  try {
    const actionTexts = {
      create: {
        title: 'فاتورة جديدة',
        message: `تم إنشاء فاتورة جديدة رقم ${invoiceNumber} بمبلغ ${amount}`
      },
      update: {
        title: 'تحديث فاتورة',
        message: `تم تحديث الفاتورة رقم ${invoiceNumber} - المبلغ: ${amount}`
      },
      delete: {
        title: 'حذف فاتورة',
        message: `تم حذف الفاتورة رقم ${invoiceNumber}`
      }
    };

    const texts = actionTexts[action];
    if (!texts) return;

    // Send notifications to all admin users
    const adminIds = await getAdminIds();
    const adminNotifications = adminIds.map(adminId => 
      sendNotification({
        recipientId: adminId,
        title: texts.title,
        message: texts.message,
        type: action === 'delete' ? 'warning' : action === 'create' ? 'success' : 'info',
        relatedType: 'none',
        createdBy: createdBy
      })
    );

    await Promise.all(adminNotifications);
  } catch (error) {
    console.error('Error sending invoice notifications:', error);
    // Don't throw - invoice operation should succeed even if notifications fail
  }
};

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
  const { items, attachments, ...invoice } = invoiceData;
  const result = await invoicesModel.createInvoice(invoice, items || [], attachments || []);
  
  // Log invoice creation
  if (createdBy && result.success) {
    await logAdd(
      createdBy,
      'فاتورة',
      `فاتورة رقم ${invoice.invoice_number || 'جديدة'}`,
      result.data?.id
    );
  }
  
  // Send notifications to admins
  if (result.success && createdBy) {
    await sendInvoiceNotificationsToAdmins(
      invoice.invoice_number || 'جديدة',
      invoice.total_amount || invoice.amount || 0,
      'create',
      createdBy
    );
  }
  
  return result;
};

const updateInvoice = async (id, invoiceData, updatedBy = null) => {
  const { items, attachments, ...invoice } = invoiceData;
  const result = await invoicesModel.updateInvoice(id, invoice, items, attachments);
  
  // Log invoice update
  if (updatedBy && result.success) {
    await logUpdate(
      updatedBy,
      'فاتورة',
      `فاتورة رقم ${invoice.invoice_number || id}`,
      id
    );
  }
  
  // Send notifications to admins
  if (result.success && updatedBy) {
    await sendInvoiceNotificationsToAdmins(
      invoice.invoice_number || id,
      invoice.total_amount || invoice.amount || 0,
      'update',
      updatedBy
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
  
  // Send notifications to admins
  if (result.success && deletedBy && invoice) {
    await sendInvoiceNotificationsToAdmins(
      invoice.invoice_number || id,
      invoice.total_amount || invoice.amount || 0,
      'delete',
      deletedBy
    );
  }
  
  return result;
};

const deleteInvoiceAttachment = async (attachmentId) => {
  return await invoicesModel.deleteInvoiceAttachment(attachmentId);
};

const uploadInvoiceAttachments = async (invoiceId, attachments, createdBy = null) => {
  return await invoicesModel.uploadInvoiceAttachments(invoiceId, attachments, createdBy);
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  getInvoicesByClientId,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  deleteInvoiceAttachment,
  uploadInvoiceAttachments
};
