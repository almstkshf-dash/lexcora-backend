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

    // Update Invoice/Bill status based on total payments
    if (invoice_id) {
      const [[invoice]] = await connection.query("SELECT amount FROM invoices WHERE id = ?", [invoice_id]);
      const [[paymentSum]] = await connection.query("SELECT SUM(amount) as total_paid FROM payments WHERE invoice_id = ?", [invoice_id]);
      
      const totalAmount = parseFloat(invoice?.amount || 0);
      const totalPaid = parseFloat(paymentSum?.total_paid || 0);
      
      const newStatus = totalPaid >= totalAmount ? 'paid' : 'partially_paid';
      await connection.query("UPDATE invoices SET status = ? WHERE id = ?", [newStatus, invoice_id]);
      
      // Accounting Posting for Receipt (AR)
      await accountingService.postAutomatedEntry('PAYMENT_RECEIVED', {
        amount,
        description: description || `Payment received for invoice ${invoice_id}`,
        reference: reference_number,
        invoice_number: invoice?.invoice_number || invoice_id, // For description template
        party_id,
        branch_id,
        bank_account_id,
        created_by
      }, connection);
    } else if (bill_id) {
      const [[bill]] = await connection.query("SELECT amount, bill_number FROM bills WHERE id = ?", [bill_id]);
      const [[paymentSum]] = await connection.query("SELECT SUM(amount) as total_paid FROM payments WHERE bill_id = ?", [bill_id]);
      
      const totalAmount = parseFloat(bill?.amount || 0);
      const totalPaid = parseFloat(paymentSum?.total_paid || 0);
      
      const newStatus = totalPaid >= totalAmount ? 'paid' : 'partially_paid';
      await connection.query("UPDATE bills SET status = ? WHERE id = ?", [newStatus, bill_id]);
      
      // Accounting Posting for Supplier Payment (AP)
      await accountingService.postAutomatedEntry('PAYMENT_MADE', {
        amount,
        description: description || `Payment made for bill ${bill_id}`,
        reference: reference_number,
        bill_number: bill?.bill_number || bill_id, // For description template
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
