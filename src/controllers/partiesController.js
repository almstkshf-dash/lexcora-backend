
const partiesService = require('../services/partiesService');
const { normalizePagination } = require('../utils/pagination');

const getAllParties = async (req, res) => {
  try {
    const { page, limit } = normalizePagination(req.query, ['id', 'name', 'phone', 'created_at']);
    const { name, phone, party_type } = req.query;
    const filters = {
      page,
      limit,
      name,
      phone,
      party_type
    };
    
    const result = await partiesService.getAllParties(filters);
    res.success(result.data, req.t('generic.ok'), 200, result.pagination);
  } catch (error) {
    res.fail('Failed to fetch parties', 500, 'PARTIES_LIST_ERROR');
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
    const { query, partyType } = req.query;
    
    // Validate minimum query length
    if (!query || query.trim().length < 3) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const result = await partiesService.searchParties(query.trim(), partyType);
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
    const { name, phone, email, excludeId } = req.query;
    
    // Validate that at least one field is provided for checking
    if (!name && !phone && !email) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one of name, phone, or email is required' 
      });
    }
    
    const duplicates = await partiesService.checkDuplicateParty(
      name || null, 
      phone || null, 
      email || null, 
      excludeId || null
    );
    
    // Check if any duplicates were found
    const hasDuplicate = !!(duplicates.name || duplicates.phone || duplicates.email);
    
    res.json({
      success: true,
      isDuplicate: hasDuplicate,
      duplicates: {
        name: duplicates.name ? { id: duplicates.name.id, name: duplicates.name.name } : null,
        phone: duplicates.phone ? { id: duplicates.phone.id, phone: duplicates.phone.phone } : null,
        email: duplicates.email ? { id: duplicates.email.id, email: duplicates.email.email } : null
      }
    });
  } catch (error) {
    console.error('Error checking duplicate party:', error);
    res.status(500).json({ success: false, error: 'Failed to check duplicate' });
  }
};

const getClientsForFinance = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      search
    };
    
    const result = await partiesService.getClientsForFinance(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching finance clients:", error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch finance clients' 
    });
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
  checkDuplicateParty,
  getClientsForFinance
};
