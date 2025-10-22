const meetingsModel = require('../models/meetingsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');
const { deleteDocumentFiles } = require('./cloudflareService');

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
  // Get meeting documents before deleting
  const documents = await meetingsModel.getMeetingDocuments(id);
  
  const meeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.deleteMeeting(id);
  
  // Delete files from Cloudflare R2
  if (documents && documents.length > 0) {
    await deleteDocumentFiles(documents);
  }
  
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

// Meeting Documents services
const getMeetingDocuments = async (meetingId) => {
  return await meetingsModel.getMeetingDocuments(meetingId);
};

const addMeetingDocuments = async (meetingId, documents, createdBy) => {
  const documentIds = [];
  for (const document of documents) {
    const id = await meetingsModel.addMeetingDocument(meetingId, document, createdBy);
    documentIds.push(id);
  }
  return documentIds;
};

const deleteMeetingDocument = async (documentId, deletedBy = null) => {
  // Get document details before deleting (for R2 deletion)
  const document = await meetingsModel.deleteMeetingDocument(documentId);
  
  // Delete file from Cloudflare R2
  if (document) {
    await deleteDocumentFiles([document]);
  }
  
  return document !== null;
};

module.exports = {
  getAllMeetings,
  getMeetingById,
  getMeetingsByPartyId,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingDocuments,
  addMeetingDocuments,
  deleteMeetingDocument
};