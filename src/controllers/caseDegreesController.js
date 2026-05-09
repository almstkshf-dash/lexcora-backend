// caseDegreesController.js
// Controller functions for case degrees

const caseDegreesService = require('../services/caseDegreesService');

// Get all case degrees
const getAllCaseDegrees = async (req, res) => {
  try {
    const caseDegrees = await caseDegreesService.getAllCaseDegrees();
    res.list(caseDegrees || [], req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_ALL_CASE_DEGREES_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('case.failedFetchDegrees'), 500, 'CASE_DEGREES_LIST_ERROR');
  }
};

// Get case degree by ID
const getCaseDegreeById = async (req, res) => {
  try {
    const caseDegree = await caseDegreesService.getCaseDegreeById(req.params.id);
    if (caseDegree) {
      res.success(caseDegree);
    } else {
      res.fail(req.t('case.degreeNotFound'), 404, 'CASE_DEGREE_NOT_FOUND');
    }
  } catch (error) {
    console.error('[GET_CASE_DEGREE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('case.failedFetchDegree'), 500, 'CASE_DEGREE_FETCH_ERROR');
  }
};

// Get case degrees by case ID
const getCaseDegreesByCaseId = async (req, res) => {
  try {
    const caseDegrees = await caseDegreesService.getCaseDegreesByCaseId(req.params.caseId);
    res.list(caseDegrees || [], req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_CASE_DEGREES_BY_CASE_ID_ERROR]', { caseId: req.params.caseId, message: error.message, stack: error.stack });
    res.fail(req.t('case.failedFetchDegrees'), 500, 'CASE_DEGREES_BY_CASE_ERROR');
  }
};

// Create new case degree
const createCaseDegree = async (req, res) => {
  try {
    const {
      case_id,
      degree,
      case_number,
      year,
      referral_date,
      client_status,
      opponent_status
    } = req.body;

    if (!case_id || !degree) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }

    const caseDegreeData = {
      case_id,
      degree,
      case_number,
      year,
      referral_date,
      client_status: client_status || null,
      opponent_status: opponent_status || null
    };

    const newCaseDegree = await caseDegreesService.createCaseDegree(caseDegreeData);
    res.created(newCaseDegree, req.t('case.degreeCreated'));
  } catch (error) {
    console.error('[CREATE_CASE_DEGREE_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('case.failedCreateDegree'), 500, 'CASE_DEGREE_CREATE_ERROR');
  }
};

// Update case degree
const updateCaseDegree = async (req, res) => {
  try {
    const {
      case_id,
      degree,
      case_number,
      year,
      referral_date,
      client_status,
      opponent_status
    } = req.body;

    const caseDegreeData = {
      case_id,
      degree,
      case_number,
      year,
      referral_date,
      client_status: client_status || null,
      opponent_status: opponent_status || null
    };

    const updated = await caseDegreesService.updateCaseDegree(req.params.id, caseDegreeData);
    
    if (updated) {
      res.success(null, req.t('case.degreeUpdated'));
    } else {
      res.fail(req.t('case.degreeNotFound'), 404, 'CASE_DEGREE_NOT_FOUND');
    }
  } catch (error) {
    console.error('[UPDATE_CASE_DEGREE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('case.failedUpdateDegree'), 500, 'CASE_DEGREE_UPDATE_ERROR');
  }
};

// Delete case degree
const deleteCaseDegree = async (req, res) => {
  try {
    const deleted = await caseDegreesService.deleteCaseDegree(req.params.id);
    
    if (deleted) {
      res.success(null, req.t('case.degreeDeleted'));
    } else {
      res.fail(req.t('case.degreeNotFound'), 404, 'CASE_DEGREE_NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_CASE_DEGREE_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('case.failedDeleteDegree'), 500, 'CASE_DEGREE_DELETE_ERROR');
  }
};

// Search case degrees
const searchCaseDegrees = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.fail(req.t('generic.searchRequired'), 400, 'SEARCH_QUERY_REQUIRED');
    }

    const caseDegrees = await caseDegreesService.searchCaseDegrees(q);
    res.list(caseDegrees || [], req.t('generic.ok'));
  } catch (error) {
    console.error('[SEARCH_CASE_DEGREES_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('case.failedFetchDegrees'), 500, 'CASE_DEGREES_SEARCH_ERROR');
  }
};

module.exports = {
  getAllCaseDegrees,
  getCaseDegreeById,
  getCaseDegreesByCaseId,
  createCaseDegree,
  updateCaseDegree,
  deleteCaseDegree,
  searchCaseDegrees
};