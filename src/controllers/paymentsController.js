const paymentsModel = require("../models/paymentsModel");

const createPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    paymentData.created_by = req.user?.id || null;
    const result = await paymentsModel.createPayment(paymentData);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('finance.failedCreatePayment') });
  }
};

const getPaymentsByInvoiceId = async (req, res) => {
  try {
    const data = await paymentsModel.getPaymentsByInvoiceId(req.params.invoiceId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('finance.failedFetchPayments') });
  }
};

const getPaymentsByBillId = async (req, res) => {
  try {
    const data = await paymentsModel.getPaymentsByBillId(req.params.billId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: req.t('finance.failedFetchPayments') });
  }
};

module.exports = {
  createPayment,
  getPaymentsByInvoiceId,
  getPaymentsByBillId
};
