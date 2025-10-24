// walletsController.js
// Controller functions for wallets

const walletsService = require('../services/walletsService');

const getWalletStats = async (req, res) => {
  try {
    const result = await walletsService.getWalletStats();
    res.json(result);
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch wallet stats' });
  }
};

const getAllWallets = async (req, res) => {
  try {
    // Extract query parameters
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      currency,
      sortBy = "created_at",
      sortOrder = "desc"
    } = req.query;

    // Validate pagination params
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pagination parameters'
      });
    }

    // Get wallets with filters
    const result = await walletsService.getAllWallets({
      page: pageNum,
      limit: limitNum,
      search,
      status,
      currency,
      sortBy,
      sortOrder
    });

    // Get stats
    const statsResult = await walletsService.getWalletStats();

    // Combine results
    const response = {
      success: result.success,
      data: result.data,
      pagination: result.pagination,
      stats: statsResult.success ? statsResult.data : null
    };

    res.json(response);
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
    }, created_by);
    
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
    }, updated_by);
    
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
    // Get deleted_by from authenticated user
    const deleted_by = req.user?.id || req.userId || null;
    
    const result = await walletsService.deleteWallet(req.params.id, deleted_by);
    
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

const getAccountStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to } = req.query;
    
    const result = await walletsService.getAccountStatement(id, from, to);
    
    if (!result.success) {
      return res.status(404).json(result);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching account statement:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch account statement' });
  }
};

module.exports = {
  getAllWallets,
  getWalletById,
  getWalletsByClientId,
  createWallet,
  updateWallet,
  deleteWallet,
  updateWalletBalance,
  getWalletStats,
  getAccountStatement
};