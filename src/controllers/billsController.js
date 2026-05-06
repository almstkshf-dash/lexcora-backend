const billsModel = require("../models/billsModel");

const getAllBills = async (req, res) => {
  try {
    const filters = {
      vendor_id: req.query.vendor_id,
      status: req.query.status,
      branch_id: req.query.branch_id
    };
    const result = await billsModel.getAllBills(filters);
    res.success(result.data, req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_ALL_BILLS_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('finance.failedFetchBills'), 500, 'BILLS_LIST_ERROR');
  }
};

const getBillById = async (req, res) => {
  try {
    const result = await billsModel.getBillById(req.params.id);
    if (!result.success) return res.fail(req.t('finance.billNotFound'), 404, 'BILL_NOT_FOUND');
    res.success(result.data);
  } catch (error) {
    console.error('[GET_BILL_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedFetchBill'), 500, 'BILL_GET_ERROR');
  }
};

const createBill = async (req, res) => {
  try {
    const { billData, items } = req.body;
    // Inject creator ID from authenticated user if available
    billData.created_by = req.user?.id || null;
    const result = await billsModel.createBill(billData, items);
    res.created(result.data, req.t('finance.billCreated'));
  } catch (error) {
    console.error('[CREATE_BILL_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('finance.failedCreateBill'), 500, 'BILL_CREATE_ERROR');
  }
};

const updateBillStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const result = await billsModel.updateBillStatus(req.params.id, status);
    res.success(result.data, req.t('finance.billUpdated'));
  } catch (error) {
    console.error('[UPDATE_BILL_STATUS_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('finance.failedUpdateBillStatus'), 500, 'BILL_UPDATE_STATUS_ERROR');
  }
};

module.exports = {
  getAllBills,
  getBillById,
  createBill,
  updateBillStatus
};
