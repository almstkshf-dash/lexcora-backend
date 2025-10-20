const eventsModel = require('../models/eventsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');

/**
 * Get all events with attendance information
 */
const getAllEvents = async () => {
  return await eventsModel.getAllEvents();
};

/**
 * Get single event by ID with attendees details
 */
const getEventById = async (id) => {
  return await eventsModel.getEventById(id);
};

/**
 * Create new event with validation
 */
const createEvent = async (eventData, createdBy = null) => {
  // Validation
  if (!eventData.title || !eventData.event_date) {
    throw new Error('العنوان والتاريخ مطلوبان');
  }

  const eventId = await eventsModel.createEvent(eventData);
  
  // Log event creation
  if (createdBy) {
    await logAdd(
      createdBy,
      'حدث',
      eventData.title || 'حدث جديد',
      eventId
    );
  }
  
  return eventId;
};

/**
 * Update existing event
 */
const updateEvent = async (id, eventData, updatedBy = null) => {
  const currentEvent = await eventsModel.getEventById(id);
  const result = await eventsModel.updateEvent(id, eventData);
  
  // Log event update
  if (updatedBy && currentEvent) {
    await logUpdate(
      updatedBy,
      'حدث',
      currentEvent.title || 'حدث',
      id
    );
  }
  
  return result;
};

/**
 * Delete event
 */
const deleteEvent = async (id, deletedBy = null) => {
  const event = await eventsModel.getEventById(id);
  const result = await eventsModel.deleteEvent(id);
  
  // Log event deletion
  if (deletedBy && event) {
    await logDelete(
      deletedBy,
      'حدث',
      event.title || 'حدث',
      id
    );
  }
  
  return result;
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
