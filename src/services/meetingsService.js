const meetingsModel = require('../models/meetingsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllMeetings = async (filters) => {
  return await meetingsModel.getAllMeetings(filters);
};

const getMeetingById = async (id) => {
  return await meetingsModel.getMeetingById(id);
};

const getMeetingsByPartyId = async (partyId) => {
  return await meetingsModel.getMeetingsByPartyId(partyId);
};

const createMeeting = async (data, createdBy = null) => {
  const meetingId = await meetingsModel.createMeeting(data);
  
  // Log meeting creation
  if (createdBy) {
    await logAdd(
      createdBy,
      'اجتماع',
      data.title || data.subject || 'اجتماع جديد',
      meetingId
    );
  }
  
  return meetingId;
};

const updateMeeting = async (id, data, updatedBy = null) => {
  const currentMeeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.updateMeeting(id, data);
  
  // Log meeting update
  if (updatedBy && currentMeeting) {
    await logUpdate(
      updatedBy,
      'اجتماع',
      currentMeeting.title || currentMeeting.subject || 'اجتماع',
      id
    );
  }
  
  return result;
};

const deleteMeeting = async (id, deletedBy = null) => {
  const meeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.deleteMeeting(id);
  
  // Log meeting deletion
  if (deletedBy && meeting) {
    await logDelete(
      deletedBy,
      'اجتماع',
      meeting.title || meeting.subject || 'اجتماع',
      id
    );
  }
  
  return result;
};

module.exports = {
  getAllMeetings,
  getMeetingById,
  getMeetingsByPartyId,
  createMeeting,
  updateMeeting,
  deleteMeeting
};