// walletsController.js
// Controller functions for wallets

const walletsService = require('../services/walletsService');

const getAllWallets = async (req, res) => {
  try {
    const result = await walletsService.getAllWallets();
    res.json(result);
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallets' });
  }
};

const getWalletById = async (req, res) => {
  try {
    const result = await walletsService.getWalletById(req.params.id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    res.json(result);
  } catch (error) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet' });
  }
};

const getWalletsByClientId = async (req, res) => {
  try {
    const result = await walletsService.getWalletsByClientId(req.params.clientId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching client wallets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client wallets' });
  }
};

const createWallet = async (req, res) => {
  try {
    const { 
      client_id, 
      currency, 
      status 
    } = req.body;
    
    // Validate required fields
    if (!client_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Client ID is required' 
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || req.userId || null;
    
    const result = await walletsService.createWallet({ 
      client_id, 
      currency, 
      status,
      created_by 
    });
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating wallet:', error);
    res.status(500).json({ success: false, error: 'Failed to create wallet' });
  }
};

const updateWallet = async (req, res) => {
  try {
    const { 
      client_id, 
      currency, 
      status 
    } = req.body;
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await walletsService.updateWallet(req.params.id, { 
      client_id, 
      currency, 
      status,
      updated_by 
    });
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ success: false, error: 'Failed to update wallet' });
  }
};

const deleteWallet = async (req, res) => {
  try {
    const result = await walletsService.deleteWallet(req.params.id);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ success: false, error: 'Failed to delete wallet' });
  }
};

const updateWalletBalance = async (req, res) => {
  try {
    const { amount, operation } = req.body;
    
    if (!amount || !operation) {
      return res.status(400).json({ 
        success: false, 
        error: 'Amount and operation are required' 
      });
    }
    
    // Get updated_by from authenticated user
    const updated_by = req.user?.id || req.userId || null;
    
    const result = await walletsService.updateWalletBalance(
      req.params.id, 
      amount, 
      operation,
      updated_by
    );
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    res.status(500).json({ success: false, error: 'Failed to update wallet balance' });
  }
};

module.exports = {
  getAllWallets,
  getWalletById,
  getWalletsByClientId,
  createWallet,
  updateWallet,
  deleteWallet,
  updateWalletBalance
};