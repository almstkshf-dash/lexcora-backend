
const branchesModel = require('../models/branchesModel');
const { logAdd, logDelete } = require('./logsService');

const getAllBranches = async () => {
  return await branchesModel.getAllBranches();
};

const createBranch = async (branch, createdBy = null) => {
  const branchId = await branchesModel.createBranch(branch);
  
  // Log branch creation
  if (createdBy) {
    await logAdd(
      createdBy,
      'فرع',
      branch.name_ar || branch.name_en || 'فرع جديد',
      branchId
    );
  }
  
  return branchId;
};

const updateBranch = async (id, branch, updatedBy = null) => {
  const result = await branchesModel.updateBranch(id, branch);
  
  // Log branch update
  if (updatedBy && result) {
    await logAdd(
      updatedBy,
      'تعديل فرع',
      branch.name_ar || branch.name_en || 'فرع',
      id
    );
  }
  
  return result;
};

const deleteBranch = async (id, deletedBy = null) => {
  // Get branch details before deletion
  let branch = null;
  if (deletedBy) {
    try {
      const branches = await branchesModel.getAllBranches();
      branch = branches.find(b => b.id === parseInt(id));
    } catch (error) {
      console.error('Error getting branch:', error);
    }
  }
  
  const result = await branchesModel.deleteBranch(id);
  
  // Log branch deletion
  if (deletedBy && branch) {
    await logDelete(
      deletedBy,
      'فرع',
      branch.name || 'فرع',
      id
    );
  }
  
  return result;
};

module.exports = {
  getAllBranches,
  createBranch,
  updateBranch,
  deleteBranch
};
