const courtsModel = require('../models/courtsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllCourts = async () => {
  return await courtsModel.getAllCourts();
};

const getCourtById = async (id) => {
  return await courtsModel.getCourtById(id);
};

const createCourt = async (court, createdBy = null) => {
  const courtId = await courtsModel.createCourt(court);
  
  // Log court creation
  if (createdBy) {
    await logAdd(
      createdBy,
      'محكمة',
      court.name || 'محكمة جديدة',
      courtId
    );
  }
  
  return courtId;
};

const updateCourt = async (id, court, updatedBy = null) => {
  const currentCourt = await courtsModel.getCourtById(id);
  const result = await courtsModel.updateCourt(id, court);
  
  // Log court update
  if (updatedBy && currentCourt) {
    await logUpdate(
      updatedBy,
      'محكمة',
      currentCourt.name || 'محكمة',
      id
    );
  }
  
  return result;
};

const deleteCourt = async (id, deletedBy = null) => {
  const court = await courtsModel.getCourtById(id);
  const result = await courtsModel.deleteCourt(id);
  
  // Log court deletion
  if (deletedBy && court) {
    await logDelete(
      deletedBy,
      'محكمة',
      court.name || 'محكمة',
      id
    );
  }
  
  return result;
};

module.exports = {
  getAllCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt
};