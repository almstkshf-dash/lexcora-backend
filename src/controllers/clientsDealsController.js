const clientsDealsService = require('../services/clientsDealsService');

const getAllClientsDeals = async (req, res) => {
  try {
    const { page, limit, client_id, type, status, created_by, start_date, end_date } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      client_id,
      type,
      status,
      created_by,
      start_date,
      end_date
    };
    
    const result = await clientsDealsService.getAllClientsDeals(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching clients deals:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clients deals' });
  }
};

const getClientDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientDeal = await clientsDealsService.getClientDealById(id);
    
    if (!clientDeal) {
      return res.status(404).json({ success: false, error: 'Client deal not found' });
    }
    
    res.json({ success: true, data: clientDeal });
  } catch (error) {
    console.error('Error fetching client deal:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client deal' });
  }
};

const getClientDealsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const clientDeals = await clientsDealsService.getClientDealsByClientId(clientId);
    res.json({ success: true, data: clientDeals });
  } catch (error) {
    console.error('Error fetching client deals by client ID:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client deals by client ID' });
  }
};

const createClientDeal = async (req, res) => {
  try {
    const data = JSON.parse(req.body.data || '{}');
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || null;
    
    // Handle uploaded files
    let uploadedFiles = [];
    if (req.body.files) {
      try {
        uploadedFiles = JSON.parse(req.body.files);
      } catch (e) {
        console.error('Error parsing files:', e);
      }
    }
    
    // Add created_by to data
    const dealData = {
      ...data,
      created_by
    };
    
    const id = await clientsDealsService.createClientDeal(dealData, uploadedFiles);
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creating client deal:', error);
    res.status(500).json({ success: false, error: 'Failed to create client deal' });
  }
};

const updateClientDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const data = JSON.parse(req.body.data || '{}');
    
    // Handle uploaded files
    let uploadedFiles = [];
    if (req.body.files) {
      try {
        uploadedFiles = JSON.parse(req.body.files);
      } catch (e) {
        console.error('Error parsing files:', e);
      }
    }
    
    const updated = await clientsDealsService.updateClientDeal(id, data, uploadedFiles);
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Client deal not found' });
    }
    
    res.json({ success: true, message: 'Client deal updated successfully' });
  } catch (error) {
    console.error('Error updating client deal:', error);
    res.status(500).json({ success: false, error: 'Failed to update client deal' });
  }
};

const deleteClientDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await clientsDealsService.deleteClientDeal(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Client deal not found' });
    }
    
    res.json({ success: true, message: 'Client deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting client deal:', error);
    res.status(500).json({ success: false, error: 'Failed to delete client deal' });
  }
};

const deleteDealDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    const deleted = await clientsDealsService.deleteDealDocument(documentId, id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal document:', error);
    res.status(500).json({ success: false, error: 'Failed to delete document' });
  }
};

module.exports = {
  getAllClientsDeals,
  getClientDealById,
  getClientDealsByClientId,
  createClientDeal,
  updateClientDeal,
  deleteClientDeal,
  deleteDealDocument
};