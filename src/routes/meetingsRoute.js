const express = require('express');
const router = express.Router();
const meetingsController = require('../controllers/meetingsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all meetings with pagination and filters
router.get('/', meetingsController.getAllMeetings);

// Get meetings by party ID
router.get('/party/:partyId', meetingsController.getMeetingsByPartyId);

// Get a specific meeting by ID
router.get('/:id', authenticateToken, meetingsController.getMeetingById);

// Create a new meeting
router.post('/', authenticateToken, meetingsController.createMeeting);

// Update a meeting
router.put('/:id', authenticateToken, meetingsController.updateMeeting);

// Delete a meeting
router.delete('/:id', authenticateToken, meetingsController.deleteMeeting);

// Meeting Documents routes
// Get all documents for a meeting
router.get('/:meetingId/documents', authenticateToken, meetingsController.getMeetingDocuments);

// Add documents to a meeting
router.post('/:meetingId/documents', authenticateToken, meetingsController.addMeetingDocuments);

// Delete a meeting document
router.delete('/documents/:documentId', authenticateToken, meetingsController.deleteMeetingDocument);

module.exports = router;