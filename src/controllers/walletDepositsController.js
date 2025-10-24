// walletDepositsController.js
// Controller functions for wallet deposits

const walletDepositsService = require('../services/walletDepositsService');

const getAllWalletDeposits = async (req, res) => {
  try {
    const result = await walletDepositsService.getAllWalletDeposits();
    res.json(result);
  } catch (error) {
    console.error('Error fetching wallet deposits:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet deposits' });
  }
};

const getWalletDepositById = async (req, res) => {
  try {
    const result = await walletDepositsService.getWalletDepositById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching wallet deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet deposit' });
  }
};

const getDepositsByWalletId = async (req, res) => {
  try {
    const result = await walletDepositsService.getDepositsByWalletId(req.params.walletId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching wallet deposits:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet deposits' });
  }
};

const getDepositsByClientId = async (req, res) => {
  try {
    const result = await walletDepositsService.getDepositsByClientId(req.params.clientId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching client deposits:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client deposits' });
  }
};

const createWalletDeposit = async (req, res) => {
  try {
    const { 
      wallet_id, 
      client_id,
      case_id,
      bank_account_id,
      amount,
      method,
      cheque_number,
      reference_no,
      note
    } = req.body;
    
    // Validate required fields
    if (!wallet_id || !client_id || !amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet ID, Client ID, and Amount are required' 
      });
    }

    // Validate amount is positive
    if (parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount must be greater than zero' 
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || req.userId || null;
    
    const result = await walletDepositsService.createWalletDeposit({ 
      wallet_id, 
      client_id,
      case_id,
      bank_account_id,
      amount,
      method: method || 'cash',
      cheque_number,
      reference_no,
      note,
      created_by 
    }, created_by);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating wallet deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to create wallet deposit' });
  }
};

const updateWalletDeposit = async (req, res) => {
  try {
    const { 
      case_id,
      bank_account_id,
      amount,
      method,
      cheque_number,
      reference_no,
      note
    } = req.body;
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await walletDepositsService.updateWalletDeposit(req.params.id, { 
      case_id,
      bank_account_id,
      amount,
      method,
      cheque_number,
      reference_no,
      note
    }, updated_by);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating wallet deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to update wallet deposit' });
  }
};

const deleteWalletDeposit = async (req, res) => {
  try {
    // Get deleted_by from authenticated user
    const deleted_by = req.user?.id || req.userId || null;
    
    const result = await walletDepositsService.deleteWalletDeposit(req.params.id, deleted_by);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting wallet deposit:', error);
    res.status(500).json({ success: false, error: 'Failed to delete wallet deposit' });
  }
};

module.exports = {
  getAllWalletDeposits,
  getWalletDepositById,
  getDepositsByWalletId,
  getDepositsByClientId,
  createWalletDeposit,
  updateWalletDeposit,
  deleteWalletDeposit
};
