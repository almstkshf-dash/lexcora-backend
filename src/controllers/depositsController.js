// depositsController.js
// Controller functions for deposits

const depositsService = require('../services/depositsService');

const getAllDeposits = async (req, res) => {
  try {
    const result = await depositsService.getAllDeposits();
    res.json(result);
  } catch (error) {
    console.error('Error fetching deposits:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deposits' });
  }
};

const getDepositById = async (req, res) => {
  try {
    const result = await depositsService.getDepositById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch deposit' });
  }
};

const createDeposit = async (req, res) => {
  try {
    const { 
      bank_account_id, 
      amount, 
      deposit_date
    } = req.body;
    
    // Validation
    if (!bank_account_id || !amount || !deposit_date) {
      return res.status(400).json({ 
        success: false, 
        message: 'رقم الحساب والمبلغ وتاريخ الإيداع مطلوبة' 
      });
    }
    
    // Get created_by from authenticated user
    const createdBy = req.user?.id || req.userId || null;
    
    const depositId = await depositsService.createDeposit({ 
      bank_account_id, 
      amount, 
      deposit_date
    }, createdBy);
    
    res.status(201).json({ 
      success: true, 
      message: 'تم إنشاء الإيداع بنجاح',
      id: depositId 
    });
  } catch (error) {
    console.error('Error creating deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to create deposit' });
  }
};

const updateDeposit = async (req, res) => {
  try {
    const { 
      bank_account_id, 
      amount, 
      deposit_date
    } = req.body;
    
    // Get updated_by from authenticated user
    const updatedBy = req.user?.id || req.userId || null;
    
    const result = await depositsService.updateDeposit(req.params.id, { 
      bank_account_id, 
      amount, 
      deposit_date
    }, updatedBy);
    
    res.json({ 
      success: true, 
      message: 'تم تحديث الإيداع بنجاح' 
    });
  } catch (error) {
    console.error('Error updating deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to update deposit' });
  }
};

const deleteDeposit = async (req, res) => {
  try {
    // Get deleted_by from authenticated user
    const deletedBy = req.user?.id || req.userId || null;
    
    const result = await depositsService.deleteDeposit(req.params.id, deletedBy);
    
    res.json({ 
      success: true, 
      message: 'تم حذف الإيداع بنجاح' 
    });
  } catch (error) {
    console.error('Error deleting deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to delete deposit' });
  }
};

module.exports = {
  getAllDeposits,
  getDepositById,
  createDeposit,
  updateDeposit,
  deleteDeposit
};
