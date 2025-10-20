const db = require('../config/db');

/**
 * Get all events with attendance count
 */
const getAllEvents = async () => {
  const [events] = await db.query(`
    SELECT 
      e.*,
      COUNT(DISTINCT ea.employee_id) as attendees_count,
      GROUP_CONCAT(DISTINCT ea.employee_id) as attendee_ids
    FROM events e
    LEFT JOIN event_attendance ea ON e.id = ea.event_id
    GROUP BY e.id
    ORDER BY e.event_date DESC, e.start_time DESC
  `);

  return events;
};

/**
 * Get single event by ID
 */
const getEventById = async (id) => {
  const [events] = await db.query(
    'SELECT * FROM events WHERE id = ?',
    [id]
  );

  if (events.length === 0) {
    return null;
  }

  const [attendees] = await db.query(`
    SELECT 
      ea.employee_id,
      e.name as employee_name,
      r.role_ar,
      r.role_en
    FROM event_attendance ea
    JOIN employees e ON ea.employee_id = e.id
    LEFT JOIN roles r ON e.role_id = r.id
    WHERE ea.event_id = ?
  `, [id]);

  return {
    ...events[0],
    attendees
  };
};

/**
 * Create new event with attendees
 */
const createEvent = async (eventData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      title,
      place,
      event_date,
      start_time,
      end_time,
      description,
      created_by,
      employee_ids = []
    } = eventData;

    // Insert event
    const [result] = await connection.query(
      `INSERT INTO events (title, place, event_date, start_time, end_time, description, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, place, event_date, start_time, end_time, description, created_by]
    );

    const eventId = result.insertId;

    // Insert attendees
    if (employee_ids && employee_ids.length > 0) {
      const attendeeValues = employee_ids.map(emp_id => [eventId, emp_id]);
      await connection.query(
        `INSERT INTO event_attendance (event_id, employee_id) VALUES ?`,
        [attendeeValues]
      );
    }

    await connection.commit();

    return eventId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Update event and its attendees
 */
const updateEvent = async (id, eventData) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      title,
      place,
      event_date,
      start_time,
      end_time,
      description,
      employee_ids = []
    } = eventData;

    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      await connection.rollback();
      return null;
    }

    // Update event
    await connection.query(
      `UPDATE events 
       SET title = ?, place = ?, event_date = ?, start_time = ?, end_time = ?, description = ?
       WHERE id = ?`,
      [title, place, event_date, start_time, end_time, description, id]
    );

    // Delete existing attendees
    await connection.query(
      'DELETE FROM event_attendance WHERE event_id = ?',
      [id]
    );

    // Insert new attendees
    if (employee_ids && employee_ids.length > 0) {
      const attendeeValues = employee_ids.map(emp_id => [id, emp_id]);
      await connection.query(
        `INSERT INTO event_attendance (event_id, employee_id) VALUES ?`,
        [attendeeValues]
      );
    }

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Delete event and its attendees
 */
const deleteEvent = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Check if event exists
    const [events] = await connection.query(
      'SELECT id FROM events WHERE id = ?',
      [id]
    );

    if (events.length === 0) {
      await connection.rollback();
      return null;
    }

    // Delete attendees first (foreign key constraint)
    await connection.query(
      'DELETE FROM event_attendance WHERE event_id = ?',
      [id]
    );

    // Delete event
    await connection.query(
      'DELETE FROM events WHERE id = ?',
      [id]
    );

    await connection.commit();

    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};
