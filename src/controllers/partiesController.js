const partiesService = require('../services/partiesService');
const { normalizePagination } = require('../utils/pagination');
const { isConstraintError, getConstraintErrorMessage } = require('../utils/dbErrors');

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
    res.list(result.data || result, req.t('generic.ok'), result.pagination);
  } catch (error) {
    console.error('[GET_ALL_PARTIES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('party.failedFetchParties'), 500, 'PARTIES_LIST_ERROR');
  }
};

const getPartiesByBranchId = async (req, res) => {
  try {
    const { branchId } = req.params;
    const parties = await partiesService.getPartiesByBranchId(branchId);
    res.list(parties);
  } catch (error) {
    console.error('[GET_PARTIES_BY_BRANCH_ID_ERROR]', { branchId: req.params.branchId, message: error.message, stack: error.stack });
    res.fail(req.t('party.failedFetchPartiesByBranch'), 500, 'GET_PARTIES_BY_BRANCH_FAILED');
  }
};

const createParty = async (req, res) => {
  try {
    const party = req.body;
    const files = party.files || [];
    
    const createdBy = req.user?.id || null;
    
    // Create party and get the ID
    const partyId = await partiesService.createParty(party, createdBy);
    
    // If files are provided, add them as party documents
    if (files.length > 0) {
      await partiesService.addPartyDocuments(partyId, files);
    }
    
    res.created({ id: partyId }, req.t('generic.created'));
  } catch (error) {
    console.error('[CREATE_PARTY_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('party.failedCreateParty'), 500, 'CREATE_PARTY_FAILED');
  }
};

const deleteParty = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await partiesService.deleteParty(req.params.id, deletedBy);
    if (success) {
      res.success(null, req.t('party.partyDeleted'));
    } else {
      res.fail(req.t('party.partyNotFound'), 404, 'PARTY_NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_PARTY_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    
    if (isConstraintError(error)) {
      return res.fail(getConstraintErrorMessage(req), 400, 'PARTY_HAS_RECORDS');
    }

    res.fail(req.t('party.failedDeleteParty'), 500, 'DELETE_PARTY_FAILED');
  }
};

const getPartyById = async (req, res) => {
  try {
    const { id } = req.params;
    const party = await partiesService.getPartyById(id);
    if (party) {
      const isAdmin = req.user && (req.user.role_en === 'admin');
      
      const partyData = {
        ...party,
        password: isAdmin ? party.password : '********'
      };
      
      res.success(partyData);
    } else {
      res.fail(req.t('party.partyNotFound'), 404, 'PARTY_NOT_FOUND');
    }
  } catch (error) {
    console.error('[GET_PARTY_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('party.failedFetchParty'), 500, 'GET_PARTY_FAILED');
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
      res.success(null, req.t('party.partyUpdated'));
    } else {
      res.fail(req.t('party.partyNotFound'), 404, 'PARTY_NOT_FOUND');
    }
  } catch (error) {
    console.error('[UPDATE_PARTY_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('party.failedUpdateParty'), 500, 'UPDATE_PARTY_FAILED');
  }
};

const getPartyCases = async (req, res) => {
  try {
    const { id } = req.params;
    const cases = await partiesService.getPartyCases(id);
    res.list(cases);
  } catch (error) {
    console.error('[GET_PARTY_CASES_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('party.failedFetchPartyCases'), 500, 'GET_PARTY_CASES_FAILED');
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
    res.list(result.data || result, req.t('generic.ok'), result.pagination);
  } catch (error) {
    console.error('[GET_POTENTIAL_CLIENTS_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('party.failedFetchPotentialClients'), 500, 'GET_POTENTIAL_CLIENTS_FAILED');
  }
};

const searchParties = async (req, res) => {
  try {
    const { query, partyType } = req.query;
    
    // Validate minimum query length
    if (!query || query.trim().length < 3) {
      return res.list([], req.t('generic.ok'));
    }
    const result = await partiesService.searchParties(query.trim(), partyType);
    res.list(result);
  } catch (error) {
    console.error('[SEARCH_PARTIES_ERROR]', { query: req.query, message: error.message, stack: error.stack });
    res.fail(req.t('party.failedSearchParties'), 500, 'SEARCH_PARTIES_FAILED');
  }
};

const checkDuplicateParty = async (req, res) => {
  try {
    const { name, phone, email, excludeId } = req.query;
    
    // Validate that at least one field is provided for checking
    if (!name && !phone && !email) {
      return res.fail(req.t('party.validationNamePhoneEmailRequired'), 400, 'VALIDATION_ERROR');
    }
    
    const duplicates = await partiesService.checkDuplicateParty(
      name || null, 
      phone || null, 
      email || null, 
      excludeId || null
    );
    
    // Check if any duplicates were found
    const hasDuplicate = !!(duplicates.name || duplicates.phone || duplicates.email);
    
    res.success({
      isDuplicate: hasDuplicate,
      duplicates: {
        name: duplicates.name ? { id: duplicates.name.id, name: duplicates.name.name } : null,
        phone: duplicates.phone ? { id: duplicates.phone.id, phone: duplicates.phone.phone } : null,
        email: duplicates.email ? { id: duplicates.email.id, email: duplicates.email.email } : null
      }
    });
  } catch (error) {
    console.error('[CHECK_DUPLICATE_PARTY_ERROR]', { query: req.query, message: error.message, stack: error.stack });
    res.fail(req.t('party.failedCheckDuplicate'), 500, 'CHECK_DUPLICATE_PARTY_FAILED');
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
    res.list(result.data || result, req.t('generic.ok'), result.pagination);
  } catch (error) {
    console.error('[GET_FINANCE_CLIENTS_ERROR]', { query: req.query, message: error.message, stack: error.stack });
    res.fail(req.t('finance.failedFetchFinanceClients'), 500, 'GET_FINANCE_CLIENTS_FAILED');
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
