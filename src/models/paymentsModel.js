const db = require("../config/db");
const accountingService = require("../services/accountingService");

const createPayment = async (paymentData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      payment_date, amount, payment_method, reference_number, 
      invoice_id, bill_id, party_id, bank_account_id, 
      description, created_by, branch_id 
    } = paymentData;

    const [result] = await connection.query(
      `INSERT INTO payments (
        payment_date, amount, payment_method, reference_number, 
        invoice_id, bill_id, party_id, bank_account_id, 
        description, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment_date, amount, payment_method, reference_number || null, 
        invoice_id || null, bill_id || null, party_id, bank_account_id || null, 
        description || null, created_by
      ]
    );

    const paymentId = result.insertId;

    // Update Invoice/Bill status if fully paid (simplified logic)
    if (invoice_id) {
      await connection.query("UPDATE invoices SET status = 'paid' WHERE id = ?", [invoice_id]);
      
      // Accounting Posting for Receipt (AR)
      await accountingService.postAutomatedEntry('PAYMENT_RECEIVED', {
        amount,
        description: description || `Payment received for invoice ${invoice_id}`,
        reference: reference_number,
        party_id,
        branch_id,
        bank_account_id,
        created_by
      }, connection);
    } else if (bill_id) {
      await connection.query("UPDATE bills SET status = 'paid' WHERE id = ?", [bill_id]);
      
      // Accounting Posting for Supplier Payment (AP)
      await accountingService.postAutomatedEntry('PAYMENT_MADE', {
        amount,
        description: description || `Payment made for bill ${bill_id}`,
        reference: reference_number,
        party_id,
        branch_id,
        bank_account_id,
        created_by
      }, connection);
    }

    await connection.commit();
    return { success: true, data: { id: paymentId } };
  } catch (error) {
    await connection.rollback();
    console.error("Error creating payment:", error);
    throw error;
  } finally {
    connection.release();
  }
};

const getPaymentsByInvoiceId = async (invoiceId) => {
  const [rows] = await db.query("SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC", [invoiceId]);
  return rows;
};

const getPaymentsByBillId = async (billId) => {
  const [rows] = await db.query("SELECT * FROM payments WHERE bill_id = ? ORDER BY payment_date DESC", [billId]);
  return rows;
};

module.exports = {
  createPayment,
  getPaymentsByInvoiceId,
  getPaymentsByBillId
};
