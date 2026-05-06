// branchesController.js
// Controller functions for branches

const branchesService = require('../services/branchesService');

const getAllBranches = async (req, res) => {
  try {
    const branches = await branchesService.getAllBranches();
    res.success(branches);
  } catch (error) {
    console.error('[GET_ALL_BRANCHES_ERROR]', { message: error.message, stack: error.stack });
    res.fail(req.t('branch.failedFetch'), 500, 'BRANCHES_LIST_ERROR');
  }
};

const createBranch = async (req, res) => {
  try {
    const { name_ar, name_en, location } = req.body;
    const createdBy = req.user?.id || null;
    const branchId = await branchesService.createBranch({ name_ar, name_en, location }, createdBy);
    res.created({ id: branchId }, req.t('generic.created'));
  } catch (error) {
    console.error('[CREATE_BRANCH_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('branch.failedCreate'), 500, 'BRANCH_CREATE_ERROR');
  }
};

const updateBranch = async (req, res) => {
  try {
    const { name_ar, name_en, location } = req.body;
    const updatedBy = req.user?.id || null;
    const success = await branchesService.updateBranch(req.params.id, { name_ar, name_en, location }, updatedBy);
    if (success) {
      res.success(null, req.t('generic.ok'));
    } else {
      res.fail(req.t('branch.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[UPDATE_BRANCH_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('branch.failedUpdate'), 500, 'BRANCH_UPDATE_ERROR');
  }
};

const deleteBranch = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await branchesService.deleteBranch(req.params.id, deletedBy);
    if (success) {
      res.success(null, req.t('generic.ok'));
    } else {
      res.fail(req.t('branch.notFound'), 404, 'NOT_FOUND');
    }
  } catch (error) {
    console.error('[DELETE_BRANCH_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('branch.failedDelete'), 500, 'BRANCH_DELETE_ERROR');
  }
};

module.exports = {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch
};
