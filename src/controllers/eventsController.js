const eventsService = require('../services/eventsService');

// Get all events with attendance count
exports.getAllEvents = async (req, res) => {
  try {
    const events = await eventsService.getAllEvents();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'خطأ في جلب الفعاليات' });
  }
};

// Get single event with attendees details
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await eventsService.getEventById(id);

    if (!event) {
      return res.status(404).json({ message: 'الفعالية غير موجودة' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'خطأ في جلب الفعالية' });
  }
};

// Create new event
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      place,
      event_date,
      start_time,
      end_time,
      description,
      employee_ids = []
    } = req.body;

    const createdBy = req.user?.id || null;

    const eventId = await eventsService.createEvent({
      title,
      place,
      event_date,
      start_time,
      end_time,
      description,
      employee_ids
    }, createdBy);

    res.status(201).json({
      message: 'تم إنشاء الفعالية بنجاح',
      eventId
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error.message === 'العنوان والتاريخ مطلوبان') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'خطأ في إنشاء الفعالية' });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      place,
      event_date,
      start_time,
      end_time,
      description,
      employee_ids = []
    } = req.body;

    const updatedBy = req.user?.id || null;

    const result = await eventsService.updateEvent(id, {
      title,
      place,
      event_date,
      start_time,
      end_time,
      description,
      employee_ids
    }, updatedBy);

    if (!result) {
      return res.status(404).json({ message: 'الفعالية غير موجودة' });
    }

    res.json({ message: 'تم تحديث الفعالية بنجاح' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'خطأ في تحديث الفعالية' });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBy = req.user?.id || null;

    const result = await eventsService.deleteEvent(id, deletedBy);

    if (!result) {
      return res.status(404).json({ message: 'الفعالية غير موجودة' });
    }

    res.json({ message: 'تم حذف الفعالية بنجاح' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'خطأ في حذف الفعالية' });
  }
};
