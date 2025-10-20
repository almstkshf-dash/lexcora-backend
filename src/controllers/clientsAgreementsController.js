const clientsAgreementsService = require('../services/clientsAgreementsService');
const { createParty } = require('../models/partiesModel');

const getAllClientsAgreements = async (req, res) => {
  try {
    const { page, limit, name, phone, status, source } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      name,
      phone,
      status,
      source
    };
    
    const result = await clientsAgreementsService.getAllClientsAgreements(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching clients agreements:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch clients agreements' });
  }
};

const getClientAgreementById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientAgreement = await clientsAgreementsService.getClientAgreementById(id);
    
    if (!clientAgreement) {
      return res.status(404).json({ success: false, error: 'Client agreement not found' });
    }
    
    res.json({ success: true, data: clientAgreement });
  } catch (error) {
    console.error('Error fetching client agreement:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch client agreement' });
  }
};

const createClientAgreement = async (req, res) => {
  try {
    const data = req.body;
    // Automatically set created_by from authenticated user
    data.created_by = req.user.id;
    
    const id = await clientsAgreementsService.createClientAgreement(data);
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creating client agreement:', error);
    res.status(500).json({ success: false, error: 'Failed to create client agreement' });
  }
};

const updateClientAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Check if status is being changed to "Converted to Client"
    if (data.status === 'Converted to Client') {
      // Get the current client agreement data first
      const clientAgreement = await clientsAgreementsService.getClientAgreementById(id);
      
      if (!clientAgreement) {
        return res.status(404).json({ success: false, error: 'Client agreement not found' });
      }
      
      // Prepare party data from client agreement data
      const partyData = {
        name: data.name || clientAgreement.name,
        phone: data.phone || clientAgreement.phone,
        address: null, // Will need to be filled later or set as null
        e_id: null, // Will need to be filled later or set as null
        category: data.category || clientAgreement.category || 'individual',
        email: null, // Will need to be filled later or set as null
        party_type: 'client', // Set as client since converted from potential client
        status: 'active',
        nationality: null, // Will need to be filled later or set as null
        branch_id: data.branch_id || clientAgreement.branch_id
      };
      
      // Create the party
      const partyId = await createParty(partyData);
      
      if (!partyId) {
        return res.status(500).json({ success: false, error: 'Failed to create party' });
      }
      
      // Delete the client agreement
      const deleted = await clientsAgreementsService.deleteClientAgreement(id);
      
      if (!deleted) {
        return res.status(500).json({ success: false, error: 'Failed to delete client agreement after conversion' });
      }
      
      res.json({ 
        success: true, 
        message: 'Client successfully converted to party and agreement deleted',
        partyId: partyId
      });
    } else {
      // Normal update process
      const updated = await clientsAgreementsService.updateClientAgreement(id, data);
      
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Client agreement not found' });
      }
      
      res.json({ success: true, message: 'Client agreement updated successfully' });
    }
  } catch (error) {
    console.error('Error updating client agreement:', error);
    res.status(500).json({ success: false, error: 'Failed to update client agreement' });
  }
};

const deleteClientAgreement = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await clientsAgreementsService.deleteClientAgreement(id);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Client agreement not found' });
    }
    
    res.json({ success: true, message: 'Client agreement deleted successfully' });
  } catch (error) {
    console.error('Error deleting client agreement:', error);
    res.status(500).json({ success: false, error: 'Failed to delete client agreement' });
  }
};

module.exports = {
  getAllClientsAgreements,
  getClientAgreementById,
  createClientAgreement,
  updateClientAgreement,
  deleteClientAgreement
};
