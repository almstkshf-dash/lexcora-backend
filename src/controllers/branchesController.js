// branchesController.js
// Controller functions for branches

const branchesService = require('../services/branchesService');

const getAllBranches = async (req, res) => {
  try {
    const branches = await branchesService.getAllBranches();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch branches' });
  }
};

const createBranch = async (req, res) => {
  try {
    const { name_ar, name_en, location } = req.body;
    const createdBy = req.user?.id || null;
    const branchId = await branchesService.createBranch({ name_ar, name_en, location }, createdBy);
    res.status(201).json({ id: branchId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create branch' });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await branchesService.deleteBranch(req.params.id, deletedBy);
    if (success) {
      res.json({ message: 'Branch deleted' });
    } else {
      res.status(404).json({ error: 'Branch not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete branch' });
  }
};

module.exports = {
  getAllBranches,
  createBranch,
  deleteBranch
};
