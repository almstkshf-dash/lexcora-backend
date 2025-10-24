
const partiesService = require('../services/partiesService');

const getAllParties = async (req, res) => {
  try {
    const { page, limit, name, phone, party_type } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      name,
      phone,
      party_type
    };
    
    const result = await partiesService.getAllParties(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parties' });
  }
};

const getPartiesByBranchId = async (req, res) => {
  try {
    const { branchId } = req.params;
    const parties = await partiesService.getPartiesByBranchId(branchId);
    res.json({ success: true, data: parties });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch parties by branch' });
  }
};

const createParty = async (req, res) => {
  try {
    const party = req.body;
    const files = party.files || [];
    
    // Add created_by from authenticated user
    party.created_by = req.user.id;
    const createdBy = req.user?.id || null;
    
    // Create party and get the ID
    const partyId = await partiesService.createParty(party, createdBy);
    
    // If files are provided, add them as party documents
    if (files.length > 0) {
      await partiesService.addPartyDocuments(partyId, files);
    }
    
    res.status(201).json({ success: true, id: partyId });
  } catch (error) {
    console.error('Error creating party:', error);
    res.status(500).json({ success: false, error: 'Failed to create party' });
  }
};

const deleteParty = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await partiesService.deleteParty(req.params.id, deletedBy);
    if (success) {
      res.json({ success: true, message: 'Party deleted' });
    } else {
      res.status(404).json({ error: 'Party not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete party' });
  }
};
const getPartyById = async (req, res) => {
  try {
    const { id } = req.params;
    const party = await partiesService.getPartyById(id);
    if (party) {
      const isAdmin = req.user && ( req.user.role_en === 'admin');
      
      const partyData = {
        ...party,
        password: isAdmin ? party.password : '********'
      };
      
      res.json(partyData);
    } else {
      res.status(404).json({ error: 'Party not found' });
    }
  } catch (error) {
    console.error('Error fetching party:', error);
    res.status(500).json({ error: 'Failed to fetch party' });
  }
};
const updateParty = async (req, res) => {
  try {
    const { id } = req.params;
    const party = req.body;
    const files = party.files || [];
    const updatedBy = req.user?.id || null;
    
    // Update party information
    const success = await partiesService.updateParty(id, party, updatedBy);
    
    // If files are provided, add them as party documents
    if (files.length > 0) {
      await partiesService.addPartyDocuments(id, files);
    }
    
    if (success) {
      res.json({ success: true, message: 'Party updated' });
    } else {
      res.status(404).json({ success: false, error: 'Party not found' });
    }
  } catch (error) {
    console.error('Error updating party:', error);
    res.status(500).json({ success: false, error: 'Failed to update party' });
  }
};

const getPartyCases = async (req, res) => {
  try {
    const { id } = req.params;
    const cases = await partiesService.getPartyCases(id);
    res.json({ success: true, data: cases });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch party cases' });
  }
};

const getPotentialClients = async (req, res) => {
  try {
    const { page, limit, name, phone, party_type } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      name,
      phone,
      party_type
    };
    
    const result = await partiesService.getPotentialClients(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch potential clients' });
  }
};

const searchParties = async (req, res) => {
  try {
    const { query } = req.query;
    
    // Validate minimum query length
    if (!query || query.trim().length < 3) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const result = await partiesService.searchParties(query.trim());
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error searching parties:', error);
    res.status(500).json({ success: false, error: 'Failed to search parties' });
  }
};

const checkDuplicateParty = async (req, res) => {
  try {
    const { name, phone, excludeId } = req.query;
    
    if (!name && !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name or phone is required' 
      });
    }
    
    const duplicate = await partiesService.checkDuplicateParty(name, phone, excludeId);
    
    if (duplicate) {
      return res.json({
        success: true,
        isDuplicate: true,
        duplicate: {
          id: duplicate.id,
          name: duplicate.name,
          phone: duplicate.phone
        }
      });
    }
    
    res.json({
      success: true,
      isDuplicate: false
    });
  } catch (error) {
    console.error('Error checking duplicate party:', error);
    res.status(500).json({ success: false, error: 'Failed to check duplicate' });
  }
};

module.exports = {
  getAllParties,
  getPartiesByBranchId,
  createParty,
  deleteParty,
  getPartyById,
  updateParty,
  getPartyCases,
  getPotentialClients,
  searchParties,
  checkDuplicateParty
};
