const eventsModel = require('../models/eventsModel');
const { logAdd, logUpdate, logDelete } = require('./logsService');
const { notifyUser } = require('../models/appNotificationsModel');

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
  
  // Send notifications to all attendees
  if (eventData.employee_ids && eventData.employee_ids.length > 0) {
    const eventDate = new Date(eventData.event_date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const notificationPromises = eventData.employee_ids.map(employeeId => 
      notifyUser({
        recipientId: employeeId,
        title: 'دعوة إلى حدث جديد',
        message: `تمت دعوتك للحضور إلى حدث "${eventData.title}" في تاريخ ${eventDate}${eventData.place ? ` في ${eventData.place}` : ''}`,
        type: 'info',
        relatedType: 'event',
        createdBy: createdBy
      }).catch(err => {
        console.error(`Failed to send notification to employee ${employeeId}:`, err);
      })
    );
    
    await Promise.all(notificationPromises);
  }
  
  return eventId;
};

/**
 * Update existing event
 */
const updateEvent = async (id, eventData, updatedBy = null) => {
  const currentEvent = await eventsModel.getEventById(id);
  
  // Get current attendee IDs
  const currentAttendeeIds = currentEvent?.attendees?.map(a => a.employee_id) || [];
  const newAttendeeIds = eventData.employee_ids || [];
  
  // Find newly added employees (present in new list but not in current list)
  const addedEmployeeIds = newAttendeeIds.filter(id => !currentAttendeeIds.includes(id));
  
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
  
  // Send notifications to newly added employees
  if (addedEmployeeIds.length > 0) {
    const eventDate = new Date(eventData.event_date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const notificationPromises = addedEmployeeIds.map(employeeId => 
      notifyUser({
        recipientId: employeeId,
        title: 'دعوة إلى حدث',
        message: `تمت دعوتك للحضور إلى حدث "${eventData.title}" في تاريخ ${eventDate}${eventData.place ? ` في ${eventData.place}` : ''}`,
        type: 'info',
        relatedType: 'event',
        createdBy: updatedBy
      }).catch(err => {
        console.error(`Failed to send notification to employee ${employeeId}:`, err);
      })
    );
    
    await Promise.all(notificationPromises);
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
