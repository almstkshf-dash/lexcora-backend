
const caseClassificationsService = require('../services/caseClassificationsService');

const getAllCaseClassifications = async (req, res) => {
  try {
    const classifications = await caseClassificationsService.getAllCaseClassifications();
    res.list(classifications || [], req.t('generic.ok'));
  } catch (error) {
    console.error('[GET_ALL_CASE_CLASSIFICATIONS_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('case.failedFetchClassifications'), 500, 'CLASSIFICATIONS_LIST_ERROR');
  }
};

const createCaseClassification = async (req, res) => {
  try {
    const classificationId = await caseClassificationsService.createCaseClassification(req.body);
    res.created({ id: classificationId }, req.t('generic.created'));
  } catch (error) {
    console.error('[CREATE_CASE_CLASSIFICATION_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('case.failedCreateClassification'), 500, 'CLASSIFICATION_CREATE_ERROR');
  }
};

const updateCaseClassification = async (req, res) => {
  try {
    const success = await caseClassificationsService.updateCaseClassification(req.params.id, req.body);
    if (success) {
      res.success(null, req.t('generic.ok'));
    } else {
      res.fail(req.t('generic.notFound'), 404, 'CLASSIFICATION_NOT_FOUND');
    }
  } catch (error) {
    console.error('[UPDATE_CASE_CLASSIFICATION_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('case.failedUpdateClassification'), 500, 'CLASSIFICATION_UPDATE_ERROR');
  }
};

const deleteCaseClassification = async (req, res) => {
  try {
    const success = await caseClassificationsService.deleteCaseClassification(req.params.id);
    if (success) {
      res.success(null, req.t('generic.ok'));
    } else {
      res.fail(req.t('generic.notFound'), 404, 'CLASSIFICATION_NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_CASE_CLASSIFICATION_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('case.failedDeleteClassification'), 500, 'CLASSIFICATION_DELETE_ERROR');
  }
};

module.exports = {
  getAllCaseClassifications,
  createCaseClassification,
  updateCaseClassification,
  deleteCaseClassification
};
