const meetingsModel = require('../models/meetingsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');
const { deleteDocumentFiles } = require('./awsS3Service');
const { notifyUser } = require('../models/appNotificationsModel');

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
  
  // Send notifications to all employee attendees
  if (data.employee_ids && data.employee_ids.length > 0) {
    const meetingDate = data.date ? new Date(data.date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';
    
    const timeInfo = data.start_time ? ` في تمام الساعة ${data.start_time}` : '';
    const locationInfo = data.address ? ` في ${data.address}` : '';
    
    const notificationPromises = data.employee_ids.map(employeeId => 
      notifyUser({
        recipientId: employeeId,
        title: 'دعوة إلى اجتماع جديد',
        message: `تمت دعوتك لحضور اجتماع في تاريخ ${meetingDate}${timeInfo}${locationInfo}`,
        type: 'info',
        relatedType: 'meeting',
        createdBy: createdBy
      }).catch(err => {
        console.error(`Failed to send notification to employee ${employeeId}:`, err);
      })
    );
    
    await Promise.all(notificationPromises);
  }
  
  return meetingId;
};

const updateMeeting = async (id, data, updatedBy = null) => {
  const currentMeeting = await meetingsModel.getMeetingById(id);
  
  // Get current attendee IDs (employees only, not clients)
  const currentAttendeeIds = currentMeeting?.attendees?.map(a => a.employee_id) || [];
  const newAttendeeIds = data.employee_ids || [];
  
  // Find newly added employees (present in new list but not in current list)
  const addedEmployeeIds = newAttendeeIds.filter(id => !currentAttendeeIds.includes(id));
  
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
  
  // Send notifications to newly added employees
  if (addedEmployeeIds.length > 0) {
    const meetingDate = data.date ? new Date(data.date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : '';
    
    const timeInfo = data.start_time ? ` في تمام الساعة ${data.start_time}` : '';
    const locationInfo = data.address ? ` في ${data.address}` : '';
    
    const notificationPromises = addedEmployeeIds.map(employeeId => 
      notifyUser({
        recipientId: employeeId,
        title: 'دعوة إلى اجتماع',
        message: `تمت دعوتك لحضور اجتماع في تاريخ ${meetingDate}${timeInfo}${locationInfo}`,
        type: 'info',
        relatedType: 'meeting',
        createdBy: updatedBy
      }).catch(err => {
        console.error(`Failed to send notification to employee ${employeeId}:`, err);
      })
    );
    
    await Promise.all(notificationPromises);
  }
  
  return result;
};

const deleteMeeting = async (id, deletedBy = null) => {
  // Get meeting documents before deleting
  const documents = await meetingsModel.getMeetingDocuments(id);
  
  const meeting = await meetingsModel.getMeetingById(id);
  const result = await meetingsModel.deleteMeeting(id);
  
  // Delete files from AWS S3
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
  // Get document details before deleting (for AWS S3 deletion)
  const document = await meetingsModel.deleteMeetingDocument(documentId);
  
  // Delete file from AWS S3
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