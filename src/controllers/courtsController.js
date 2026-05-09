// courtsController.js
// Controller functions for courts

const courtsService = require('../services/courtsService');

const getAllCourts = async (req, res) => {
  try {
    const courts = await courtsService.getAllCourts();
    res.list(courts || []);
  } catch (error) {
    console.error('[GET_ALL_COURTS_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('court.failedFetch'), 500, 'COURTS_LIST_ERROR');
  }
};

const getCourtById = async (req, res) => {
  try {
    const court = await courtsService.getCourtById(req.params.id);
    if (court) {
      res.success(court);
    } else {
      res.fail(req.t('court.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[GET_COURT_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('court.failedFetch'), 500, 'COURT_GET_ERROR');
  }
};

const createCourt = async (req, res) => {
  try {
    const { court_ar, court_en } = req.body;
    const createdBy = req.user?.id || null;
    const courtId = await courtsService.createCourt({ court_ar, court_en }, createdBy);
    res.created({ id: courtId }, req.t('generic.created'));
  } catch (error) {
    console.error('[CREATE_COURT_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('court.failedCreate'), 500, 'COURT_CREATE_ERROR');
  }
};

const updateCourt = async (req, res) => {
  try {
    const { court_ar, court_en } = req.body;
    const updatedBy = req.user?.id || null;
    const success = await courtsService.updateCourt(req.params.id, { court_ar, court_en }, updatedBy);
    if (success) {
      res.success(null, req.t('generic.ok'));
    } else {
      res.fail(req.t('court.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[UPDATE_COURT_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('court.failedUpdate'), 500, 'COURT_UPDATE_ERROR');
  }
};

const deleteCourt = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await courtsService.deleteCourt(req.params.id, deletedBy);
    if (success) {
      res.success(null, req.t('court.deleted'));
    } else {
      res.fail(req.t('court.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_COURT_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('court.failedDelete'), 500, 'COURT_DELETE_ERROR');
  }
};

module.exports = {
  getAllCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt
};