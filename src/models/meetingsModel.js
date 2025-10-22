const db = require("../config/db");

const getAllMeetings = async (filters = {}) => {
  const { page = 1, limit = 10, party_id, date, meet_result, created_by, search, meeting_type } = filters;
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically
  let whereClause = '';
  const params = [];

  const conditions = [];
  if (party_id) {
    conditions.push('m.party_id = ?');
    params.push(party_id);
  }
  if (date) {
    conditions.push('m.date = ?');
    params.push(date);
  }
  if (meet_result) {
    conditions.push('m.meet_result = ?');
    params.push(meet_result);
  }
  if (created_by) {
    conditions.push('m.created_by = ?');
    params.push(created_by);
  }
  if (meeting_type) {
    conditions.push('m.meeting_type = ?');
    params.push(meeting_type);
  }
  if (search) {
    conditions.push('(p.name LIKE ? OR p.phone LIKE ? OR m.note LIKE ? OR m.address LIKE ?)');
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Get total count for pagination
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM meetings m 
    LEFT JOIN parties p ON m.party_id = p.id
    ${whereClause}
  `;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Get paginated data with related information
  const dataQuery = `
    SELECT m.*, 
           p.name as party_name,
           p.phone as party_phone,
           e.name as created_by_name,
           p.name as client_name,
           p.phone as client_phone,
           COUNT(DISTINCT ma.employee_id) as attendees_count,
           GROUP_CONCAT(DISTINCT ma.employee_id) as attendee_ids
    FROM meetings m
    LEFT JOIN parties p ON m.party_id = p.id
    LEFT JOIN employees e ON m.created_by = e.id
    LEFT JOIN meeting_attendance ma ON m.id = ma.meeting_id
    ${whereClause} 
    GROUP BY m.id
    ORDER BY m.date DESC, m.start_time DESC 
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(dataQuery, [...params, limit, offset]);

  return {
    data: rows,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

const getMeetingById = async (id) => {
  const query = `
    SELECT m.*, 
           p.name as party_name,
           p.phone as party_phone,
           e.name as created_by_name,
           p.name as client_name,
           p.phone as client_phone
    FROM meetings m
    LEFT JOIN parties p ON m.party_id = p.id
    LEFT JOIN employees e ON m.created_by = e.id
    WHERE m.id = ?
  `;
  const [rows] = await db.query(query, [id]);
  const meeting = rows[0];
  
  if (!meeting) {
    return null;
  }

  // Get attendees
  const [attendees] = await db.query(`
    SELECT 
      ma.employee_id,
      emp.name as employee_name,
      r.role_ar,
      r.role_en
    FROM meeting_attendance ma
    JOIN employees emp ON ma.employee_id = emp.id
    LEFT JOIN roles r ON emp.role_id = r.id
    WHERE ma.meeting_id = ?
  `, [id]);
  
  // Format date for frontend consumption
  if (meeting.date) {
    const date = new Date(meeting.date);
    meeting.date = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  return {
    ...meeting,
    attendees
  };
};

const getMeetingsByPartyId = async (partyId) => {
  const query = `
    SELECT m.*, 
           p.name as party_name,
           p.phone as party_phone,
           e.name as created_by_name,
           p.name as client_name,
           p.phone as client_phone,
           COUNT(DISTINCT ma.employee_id) as attendees_count
    FROM meetings m
    LEFT JOIN parties p ON m.party_id = p.id
    LEFT JOIN employees e ON m.created_by = e.id
    LEFT JOIN meeting_attendance ma ON m.id = ma.meeting_id
    WHERE m.party_id = ?
    GROUP BY m.id
    ORDER BY m.date DESC, m.start_time DESC
  `;
  const [rows] = await db.query(query, [partyId]);
  return rows;
};

const createMeeting = async (data) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { 
      party_id, 
      note, 
      date, 
      start_time, 
      end_time, 
      meet_result, 
      created_by, 
      meeting_type, 
      address,
      employee_ids = []
    } = data;
    
    const query = `
      INSERT INTO meetings (party_id, note, date, start_time, end_time, meet_result, created_by, meeting_type, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await connection.query(query, [
      party_id,
      note || null,
      date,
      start_time || null,
      end_time || null,
      meet_result || null,
      created_by || null,
      meeting_type || null,
      address || null
    ]);
    
    const meetingId = result.insertId;

    // Insert attendees
    if (employee_ids && employee_ids.length > 0) {
      const attendeeValues = employee_ids.map(emp_id => [meetingId, emp_id]);
      await connection.query(
        `INSERT INTO meeting_attendance (meeting_id, employee_id) VALUES ?`,
        [attendeeValues]
      );
    }

    await connection.commit();
    
    return meetingId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const updateMeeting = async (id, data) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { 
      party_id, 
      note, 
      date, 
      start_time, 
      end_time, 
      meet_result, 
      meeting_type, 
      address,
      employee_ids = []
    } = data;
    
    // Check if meeting exists
    const [meetings] = await connection.query(
      'SELECT id FROM meetings WHERE id = ?',
      [id]
    );

    if (meetings.length === 0) {
      await connection.rollback();
      return false;
    }

    const query = `
      UPDATE meetings 
      SET party_id = ?, note = ?, date = ?, start_time = ?, end_time = ?, meet_result = ?, meeting_type = ?, address = ?
      WHERE id = ?
    `;
    
    await connection.query(query, [
      party_id,
      note || null,
      date,
      start_time || null,
      end_time || null,
      meet_result || null,
      meeting_type || null,
      address || null,
      id
    ]);

    // Delete existing attendees
    await connection.query(
      'DELETE FROM meeting_attendance WHERE meeting_id = ?',
      [id]
    );

    // Insert new attendees
    if (employee_ids && employee_ids.length > 0) {
      const attendeeValues = employee_ids.map(emp_id => [id, emp_id]);
      await connection.query(
        `INSERT INTO meeting_attendance (meeting_id, employee_id) VALUES ?`,
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

const deleteMeeting = async (id) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    // Check if meeting exists
    const [meetings] = await connection.query(
      'SELECT id FROM meetings WHERE id = ?',
      [id]
    );

    if (meetings.length === 0) {
      await connection.rollback();
      return false;
    }

    // Delete attendees first (foreign key constraint)
    await connection.query(
      'DELETE FROM meeting_attendance WHERE meeting_id = ?',
      [id]
    );

    // Delete meeting
    const query = 'DELETE FROM meetings WHERE id = ?';
    await connection.query(query, [id]);

    await connection.commit();
    
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Meeting Documents functions
const getMeetingDocuments = async (meetingId) => {
  const query = `
    SELECT md.*, e.name as created_by_name
    FROM meetings_documents md
    LEFT JOIN employees e ON md.created_by = e.id
    WHERE md.meeting_id = ?
    ORDER BY md.created_at DESC
  `;
  const [rows] = await db.query(query, [meetingId]);
  return rows;
};

const addMeetingDocument = async (meetingId, document, createdBy) => {
  const query = `
    INSERT INTO meetings_documents (meeting_id, document_name, document_url, created_by)
    VALUES (?, ?, ?, ?)
  `;
  const [result] = await db.query(query, [
    meetingId,
    document.document_name,
    document.document_url,
    createdBy
  ]);
  return result.insertId;
};

const deleteMeetingDocument = async (documentId) => {
  const query = 'SELECT * FROM meetings_documents WHERE id = ?';
  const [rows] = await db.query(query, [documentId]);
  const document = rows[0];
  
  if (!document) {
    return null;
  }
  
  const deleteQuery = 'DELETE FROM meetings_documents WHERE id = ?';
  const [result] = await db.query(deleteQuery, [documentId]);
  
  return document; // Return document for R2 deletion
};

module.exports = {
  getAllMeetings,
  getMeetingById,
  getMeetingsByPartyId,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingDocuments,
  addMeetingDocument,
  deleteMeetingDocument
};