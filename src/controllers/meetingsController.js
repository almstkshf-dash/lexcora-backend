const meetingsService = require('../services/meetingsService');

const getAllMeetings = async (req, res) => {
  try {
    const { page, limit, party_id, date, meet_result, created_by, search, meeting_type } = req.query;
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      party_id,
      date,
      meet_result,
      created_by,
      search,
      meeting_type
    };
    
    const result = await meetingsService.getAllMeetings(filters);
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch meetings' });
  }
};

const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await meetingsService.getMeetingById(id);
    
    if (!meeting) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }
    
    res.json({ success: true, data: meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch meeting' });
  }
};

const getMeetingsByPartyId = async (req, res) => {
  try {
    const { partyId } = req.params;
    const meetings = await meetingsService.getMeetingsByPartyId(partyId);
    res.json({ success: true, data: meetings });
  } catch (error) {
    console.error('Error fetching meetings by party:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch meetings by party' });
  }
};

const createMeeting = async (req, res) => {
  try {
    const createdBy = req.user?.id || null;
    const data = req.body;
    const id = await meetingsService.createMeeting(data, createdBy);
    res.status(201).json({ success: true, id });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to create meeting' });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || null;
    const data = req.body;
    const updated = await meetingsService.updateMeeting(id, data, updatedBy);
    
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }
    
    res.json({ success: true, message: 'Meeting updated successfully' });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to update meeting' });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.id || null;
    const deleted = await meetingsService.deleteMeeting(id, deletedBy);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Meeting not found' });
    }
    
    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ success: false, error: 'Failed to delete meeting' });
  }
};

// Meeting Documents Controllers
const getMeetingDocuments = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const documents = await meetingsService.getMeetingDocuments(meetingId);
    res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Error fetching meeting documents:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch meeting documents' });
  }
};

const addMeetingDocuments = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { documents } = req.body;
    const createdBy = req.user?.id || null;
    
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ success: false, error: 'No documents provided' });
    }
    
    const documentIds = await meetingsService.addMeetingDocuments(meetingId, documents, createdBy);
    res.status(201).json({ success: true, data: documentIds });
  } catch (error) {
    console.error('Error adding meeting documents:', error);
    res.status(500).json({ success: false, error: 'Failed to add meeting documents' });
  }
};

const deleteMeetingDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const deletedBy = req.user?.id || null;
    const deleted = await meetingsService.deleteMeetingDocument(documentId, deletedBy);
    
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Document not found' });
    }
    
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting document:', error);
    res.status(500).json({ success: false, error: 'Failed to delete meeting document' });
  }
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