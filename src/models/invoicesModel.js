const db = require("../config/db");

const getAllInvoices = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        i.id,
        i.invoice_date,
        i.invoice_number,
        i.amount,
        i.client_id,
        i.branch_id,
        i.bank_account_id,
        i.status,
        i.vat,
        i.currency,
        i.created_at,
        i.created_by,
        c.name as client_name,
        b.name_ar as branch_name,
        ba.bank_name,
        ba.account_number,
        creator.name as created_by_name
      FROM invoices i
      LEFT JOIN parties c ON i.client_id = c.id
      LEFT JOIN branches b ON i.branch_id = b.id
      LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
      LEFT JOIN employees creator ON i.created_by = creator.id
      ORDER BY i.created_at DESC
    `);
    return { success: true, data: rows };
  } catch (error) {
    console.error('invoicesModel: Database query failed:', error);
    // Fallback to simple query if JOIN fails
    try {
      const [rows] = await db.query("SELECT * FROM invoices ORDER BY created_at DESC");
      return { success: true, data: rows };
    } catch (fallbackError) {
      console.error('invoicesModel: Fallback query also failed:', fallbackError);
      throw fallbackError;
    }
  }
};

const getInvoiceById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      i.id,
      i.invoice_date,
      i.invoice_number,
      i.amount,
      i.client_id,
      i.branch_id,
      i.bank_account_id,
      i.status,
      i.vat,
      i.currency,
      i.created_at,
      i.created_by,
      c.name as client_name,
      b.name_ar as branch_name,
      ba.bank_name,
      ba.account_number,
      creator.name as created_by_name
    FROM invoices i
    LEFT JOIN parties c ON i.client_id = c.id
    LEFT JOIN branches b ON i.branch_id = b.id
    LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
    LEFT JOIN employees creator ON i.created_by = creator.id
    WHERE i.id = ?
  `, [id]);
  
  if (rows.length === 0) {
    return { success: false, message: 'Invoice not found' };
  }

  // Get invoice items
  const [items] = await db.query(`
    SELECT id, invoice_id, description, amount
    FROM invoice_items
    WHERE invoice_id = ?
    ORDER BY id
  `, [id]);

  // Get invoice attachments
  const [attachments] = await db.query(`
    SELECT id, attachment_url, attachment_name, created_by, created_at
    FROM invoice_attachments
    WHERE invoice_id = ?
    ORDER BY created_at DESC
  `, [id]);

  return { 
    success: true, 
    data: {
      ...rows[0],
      items: items,
      attachments: attachments
    }
  };
};

const createInvoice = async (invoice, items, attachments = []) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Generate invoice number if not provided
    let invoiceNumber = invoice.invoice_number;
    if (!invoiceNumber) {
      const [result] = await connection.query(
        "SELECT CONCAT('INV-', YEAR(CURDATE()), '-', LPAD(COALESCE(MAX(CAST(SUBSTRING(invoice_number, 10) AS UNSIGNED)), 0) + 1, 5, '0')) as next_number FROM invoices WHERE invoice_number LIKE CONCAT('INV-', YEAR(CURDATE()), '%')"
      );
      invoiceNumber = result[0].next_number || `INV-${new Date().getFullYear()}-00001`;
    }

    // Insert invoice
    const [invoiceResult] = await connection.query(
      `INSERT INTO invoices (
        invoice_date, 
        invoice_number, 
        amount,
        client_id, 
        branch_id,
        bank_account_id,
        status,
        vat,
        currency,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice.invoice_date,
        invoiceNumber,
        invoice.amount,
        invoice.client_id || null,
        invoice.branch_id || null,
        invoice.bank_account_id || null,
        invoice.status || 'pending',
        invoice.vat || 0,
        invoice.currency || 'AED',
        invoice.created_by
      ]
    );

    const invoiceId = invoiceResult.insertId;

    // Insert invoice items
    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        invoiceId,
        item.description,
        item.amount
      ]);

      await connection.query(
        `INSERT INTO invoice_items (invoice_id, description, amount) VALUES ?`,
        [itemValues]
      );
    }

    // Insert invoice attachments
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map(att => [
        invoiceId,
        att.attachment_url,
        att.attachment_name,
        invoice.created_by
      ]);

      await connection.query(
        `INSERT INTO invoice_attachments (invoice_id, attachment_url, attachment_name, created_by) VALUES ?`,
        [attachmentValues]
      );
    }

    // Update bank account balance when invoice is created
    if (invoice.bank_account_id && invoice.amount) {
      await connection.query(
        `UPDATE bank_accounts 
         SET current_balance = current_balance + ? 
         WHERE id = ?`,
        [invoice.amount, invoice.bank_account_id]
      );
    }

    await connection.commit();

    return { 
      success: true, 
      message: 'Invoice created successfully',
      data: { id: invoiceId, invoice_number: invoiceNumber }
    };
  } catch (error) {
    await connection.rollback();
    console.error('createInvoice error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const updateInvoice = async (id, invoice, items, attachments = null) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get current invoice
    const [currentInvoice] = await connection.query(
      'SELECT * FROM invoices WHERE id = ?',
      [id]
    );

    if (currentInvoice.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Invoice not found' };
    }

    // Update invoice
    const updateFields = [];
    const updateValues = [];

    if (invoice.invoice_date !== undefined) {
      updateFields.push('invoice_date = ?');
      updateValues.push(invoice.invoice_date);
    }
    if (invoice.amount !== undefined) {
      updateFields.push('amount = ?');
      updateValues.push(invoice.amount);
    }
    if (invoice.client_id !== undefined) {
      updateFields.push('client_id = ?');
      updateValues.push(invoice.client_id || null);
    }
    if (invoice.branch_id !== undefined) {
      updateFields.push('branch_id = ?');
      updateValues.push(invoice.branch_id || null);
    }
    if (invoice.bank_account_id !== undefined) {
      updateFields.push('bank_account_id = ?');
      updateValues.push(invoice.bank_account_id || null);
    }
    if (invoice.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(invoice.status);
    }
    if (invoice.vat !== undefined) {
      updateFields.push('vat = ?');
      updateValues.push(invoice.vat);
    }
    if (invoice.currency !== undefined) {
      updateFields.push('currency = ?');
      updateValues.push(invoice.currency);
    }

    // Handle bank account balance changes
    const oldBankAccountId = currentInvoice[0].bank_account_id;
    const oldAmount = parseFloat(currentInvoice[0].amount);
    const newBankAccountId = invoice.bank_account_id !== undefined ? invoice.bank_account_id : oldBankAccountId;
    const newAmount = invoice.amount !== undefined ? parseFloat(invoice.amount) : oldAmount;

    // Reverse old bank account balance if it exists
    if (oldBankAccountId) {
      await connection.query(
        `UPDATE bank_accounts 
         SET current_balance = current_balance - ? 
         WHERE id = ?`,
        [oldAmount, oldBankAccountId]
      );
    }

    // Add to new bank account balance if it exists
    if (newBankAccountId) {
      await connection.query(
        `UPDATE bank_accounts 
         SET current_balance = current_balance + ? 
         WHERE id = ?`,
        [newAmount, newBankAccountId]
      );
    }

    if (updateFields.length > 0) {
      updateValues.push(id);
      await connection.query(
        `UPDATE invoices SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update invoice items if provided
    if (items !== undefined) {
      // Delete old items
      await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

      // Insert new items
      if (items.length > 0) {
        const itemValues = items.map(item => [
          id,
          item.description,
          item.amount
        ]);

        await connection.query(
          `INSERT INTO invoice_items (invoice_id, description, amount) VALUES ?`,
          [itemValues]
        );
      }
    }

    // Update attachments if provided
    if (attachments !== null && Array.isArray(attachments)) {
      // Delete old attachments
      await connection.query('DELETE FROM invoice_attachments WHERE invoice_id = ?', [id]);

      // Insert new attachments
      if (attachments.length > 0) {
        const attachmentValues = attachments.map(att => [
          id,
          att.attachment_url,
          att.attachment_name,
          att.created_by || invoice.created_by || currentInvoice[0].created_by
        ]);

        await connection.query(
          `INSERT INTO invoice_attachments (invoice_id, attachment_url, attachment_name, created_by) VALUES ?`,
          [attachmentValues]
        );
      }
    }

    await connection.commit();

    return { 
      success: true, 
      message: 'Invoice updated successfully'
    };
  } catch (error) {
    await connection.rollback();
    console.error('updateInvoice error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const deleteInvoice = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get invoice info before deleting
    const [invoice] = await connection.query(
      'SELECT * FROM invoices WHERE id = ?',
      [id]
    );

    if (invoice.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Invoice not found' };
    }

    // Reverse bank account balance if invoice had a bank account
    if (invoice[0].bank_account_id && invoice[0].amount) {
      await connection.query(
        `UPDATE bank_accounts 
         SET current_balance = current_balance - ? 
         WHERE id = ?`,
        [invoice[0].amount, invoice[0].bank_account_id]
      );
    }

    // Delete invoice attachments (CASCADE should handle this, but being explicit)
    await connection.query('DELETE FROM invoice_attachments WHERE invoice_id = ?', [id]);

    // Delete invoice items (CASCADE should handle this, but being explicit)
    await connection.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

    // Delete invoice
    await connection.query('DELETE FROM invoices WHERE id = ?', [id]);

    await connection.commit();

    return { 
      success: true, 
      message: 'Invoice deleted successfully'
    };
  } catch (error) {
    await connection.rollback();
    console.error('deleteInvoice error:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const getInvoicesByClientId = async (clientId) => {
  const [rows] = await db.query(`
    SELECT 
      i.id,
      i.invoice_date,
      i.invoice_number,
      i.amount,
      i.client_id,
      i.branch_id,
      i.bank_account_id,
      i.status,
      i.vat,
      i.currency,
      i.created_at,
      i.created_by,
      c.name as client_name,
      b.name_ar as branch_name,
      ba.bank_name,
      ba.account_number,
      creator.name as created_by_name
    FROM invoices i
    LEFT JOIN parties c ON i.client_id = c.id
    LEFT JOIN branches b ON i.branch_id = b.id
    LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
    LEFT JOIN employees creator ON i.created_by = creator.id
    WHERE i.client_id = ?
    ORDER BY i.created_at DESC
  `, [clientId]);
  
  return { success: true, data: rows };
};

const deleteInvoiceAttachment = async (attachmentId) => {
  const connection = await db.getConnection();
  
  try {
    // Get attachment details before deletion (for file system cleanup if needed)
    const [attachments] = await connection.query(
      'SELECT * FROM invoice_attachments WHERE id = ?',
      [attachmentId]
    );
    
    if (attachments.length === 0) {
      return { success: false, error: 'Attachment not found' };
    }
    
    // Delete attachment from database
    await connection.query('DELETE FROM invoice_attachments WHERE id = ?', [attachmentId]);
    
    // TODO: Delete physical file from filesystem if needed
    // const fs = require('fs');
    // const filePath = attachments[0].file_path;
    // if (fs.existsSync(filePath)) {
    //   fs.unlinkSync(filePath);
    // }
    
    return { success: true, message: 'Attachment deleted successfully' };
  } catch (error) {
    console.error('Error deleting invoice attachment:', error);
    throw error;
  } finally {
    connection.release();
  }
};

const uploadInvoiceAttachments = async (invoiceId, attachments, createdBy = null) => {
  const connection = await db.getConnection();
  
  try {
    // Verify invoice exists
    const [invoices] = await connection.query(
      'SELECT id FROM invoices WHERE id = ?',
      [invoiceId]
    );
    
    if (invoices.length === 0) {
      return { success: false, error: 'Invoice not found' };
    }
    
    // Insert attachments - store the full S3 URL (public or pre-signed)
    if (attachments && attachments.length > 0) {
      const attachmentValues = attachments.map(attachment => [
        invoiceId,
        attachment.attachment_url,
        attachment.attachment_name,
        createdBy
      ]);
      
      await connection.query(
        `INSERT INTO invoice_attachments (invoice_id, attachment_url, attachment_name, created_by) VALUES ?`,
        [attachmentValues]
      );
    }
    
    return { success: true, message: 'Attachments uploaded successfully' };
  } catch (error) {
    console.error('Error uploading invoice attachments:', error);
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByClientId,
  deleteInvoiceAttachment,
  uploadInvoiceAttachments
};
