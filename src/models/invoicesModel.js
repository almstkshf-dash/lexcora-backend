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
        i.referred_by_employee_id,
        i.bank_account_id,
        i.status,
        i.created_at,
        i.created_by,
        c.name as client_name,
        e.name as referred_by_employee_name,
        ba.account_number,
        ba.account_name,
        ba.bank_name,
        creator.name as created_by_name
      FROM invoices i
      LEFT JOIN parties c ON i.client_id = c.id
      LEFT JOIN employees e ON i.referred_by_employee_id = e.id
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
      i.referred_by_employee_id,
      i.bank_account_id,
      i.status,
      i.created_at,
      i.created_by,
      c.name as client_name,
      e.name as referred_by_employee_name,
      ba.account_number,
      ba.account_name,
      ba.bank_name,
      creator.name as created_by_name
    FROM invoices i
    LEFT JOIN parties c ON i.client_id = c.id
    LEFT JOIN employees e ON i.referred_by_employee_id = e.id
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

  return { 
    success: true, 
    data: {
      ...rows[0],
      items: items
    }
  };
};

const createInvoice = async (invoice, items) => {
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
        referred_by_employee_id, 
        bank_account_id, 
        status, 
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoice.invoice_date,
        invoiceNumber,
        invoice.amount,
        invoice.client_id || null,
        invoice.referred_by_employee_id || null,
        invoice.bank_account_id,
        invoice.status || 'draft',
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

    // If invoice is paid, update bank account balance
    if (invoice.status === 'paid') {
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

const updateInvoice = async (id, invoice, items) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Get current invoice to check status change
    const [currentInvoice] = await connection.query(
      'SELECT status, amount, bank_account_id FROM invoices WHERE id = ?',
      [id]
    );

    if (currentInvoice.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Invoice not found' };
    }

    const oldStatus = currentInvoice[0].status;
    const oldAmount = parseFloat(currentInvoice[0].amount);
    const oldBankAccountId = currentInvoice[0].bank_account_id;

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
    if (invoice.referred_by_employee_id !== undefined) {
      updateFields.push('referred_by_employee_id = ?');
      updateValues.push(invoice.referred_by_employee_id || null);
    }
    if (invoice.bank_account_id !== undefined) {
      updateFields.push('bank_account_id = ?');
      updateValues.push(invoice.bank_account_id);
    }
    if (invoice.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(invoice.status);
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

    // Handle bank account balance changes
    const newStatus = invoice.status !== undefined ? invoice.status : oldStatus;
    const newAmount = invoice.amount !== undefined ? parseFloat(invoice.amount) : oldAmount;
    const newBankAccountId = invoice.bank_account_id !== undefined ? invoice.bank_account_id : oldBankAccountId;

    // If status changed from paid to something else, reverse the payment
    if (oldStatus === 'paid' && newStatus !== 'paid') {
      await connection.query(
        `UPDATE bank_accounts 
         SET current_balance = current_balance - ? 
         WHERE id = ?`,
        [oldAmount, oldBankAccountId]
      );
    }

    // If status changed to paid, add the payment
    if (oldStatus !== 'paid' && newStatus === 'paid') {
      await connection.query(
        `UPDATE bank_accounts 
         SET current_balance = current_balance + ? 
         WHERE id = ?`,
        [newAmount, newBankAccountId]
      );
    }

    // If already paid but amount or bank account changed
    if (oldStatus === 'paid' && newStatus === 'paid') {
      if (oldAmount !== newAmount || oldBankAccountId !== newBankAccountId) {
        // Reverse old payment
        await connection.query(
          `UPDATE bank_accounts 
           SET current_balance = current_balance - ? 
           WHERE id = ?`,
          [oldAmount, oldBankAccountId]
        );
        
        // Apply new payment
        await connection.query(
          `UPDATE bank_accounts 
           SET current_balance = current_balance + ? 
           WHERE id = ?`,
          [newAmount, newBankAccountId]
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
      'SELECT status, amount, bank_account_id FROM invoices WHERE id = ?',
      [id]
    );

    if (invoice.length === 0) {
      await connection.rollback();
      return { success: false, message: 'Invoice not found' };
    }

    // If invoice was paid, reverse the payment
    if (invoice[0].status === 'paid') {
      await connection.query(
        `UPDATE bank_accounts 
         SET current_balance = current_balance - ? 
         WHERE id = ?`,
        [invoice[0].amount, invoice[0].bank_account_id]
      );
    }

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
      i.referred_by_employee_id,
      i.bank_account_id,
      i.status,
      i.created_at,
      i.created_by,
      c.name as client_name,
      e.name as referred_by_employee_name,
      ba.account_number,
      ba.account_name,
      ba.bank_name,
      creator.name as created_by_name
    FROM invoices i
    LEFT JOIN parties c ON i.client_id = c.id
    LEFT JOIN employees e ON i.referred_by_employee_id = e.id
    LEFT JOIN bank_accounts ba ON i.bank_account_id = ba.id
    LEFT JOIN employees creator ON i.created_by = creator.id
    WHERE i.client_id = ?
    ORDER BY i.created_at DESC
  `, [clientId]);
  
  return { success: true, data: rows };
};

module.exports = {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  getInvoicesByClientId
};
