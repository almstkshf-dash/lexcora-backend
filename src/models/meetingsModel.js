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
    conditions.push('(p.name LIKE ? OR p.phone LIKE ? OR l.name LIKE ? OR m.note LIKE ?)');
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
    LEFT JOIN employees l ON m.lawyer_id = l.id
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
           l.name as lawyer_name,
           p.name as client_name,
           p.phone as client_phone
    FROM meetings m
    LEFT JOIN parties p ON m.party_id = p.id
    LEFT JOIN employees e ON m.created_by = e.id
    LEFT JOIN employees l ON m.lawyer_id = l.id
    ${whereClause} 
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
           l.name as lawyer_name
    FROM meetings m
    LEFT JOIN parties p ON m.party_id = p.id
    LEFT JOIN employees e ON m.created_by = e.id
    LEFT JOIN employees l ON m.lawyer_id = l.id
    WHERE m.id = ?
  `;
  const [rows] = await db.query(query, [id]);
  const meeting = rows[0];
  
  // Format date for frontend consumption
  if (meeting && meeting.date) {
    const date = new Date(meeting.date);
    meeting.date = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
  
  return meeting;
};

const getMeetingsByPartyId = async (partyId) => {
  const query = `
    SELECT m.*, 
           p.name as party_name,
           p.phone as party_phone,
           e.name as created_by_name,
           l.name as lawyer_name
    FROM meetings m
    LEFT JOIN parties p ON m.party_id = p.id
    LEFT JOIN employees e ON m.created_by = e.id
    LEFT JOIN employees l ON m.lawyer_id = l.id
    WHERE m.party_id = ?
    ORDER BY m.date DESC, m.start_time DESC
  `;
  const [rows] = await db.query(query, [partyId]);
  return rows;
};

const createMeeting = async (data) => {
  const { party_id, note, date, start_time, end_time, meet_result, created_by, lawyer_id, meeting_type } = data;
  
  const query = `
    INSERT INTO meetings (party_id, note, date, start_time, end_time, meet_result, created_by, lawyer_id, meeting_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await db.query(query, [
    party_id,
    note || null,
    date,
    start_time || null,
    end_time || null,
    meet_result || null,
    created_by || null,
    lawyer_id || null,
    meeting_type || null
  ]);
  
  return result.insertId;
};

const updateMeeting = async (id, data) => {
  const { party_id, note, date, start_time, end_time, meet_result, lawyer_id, meeting_type } = data;
  
  const query = `
    UPDATE meetings 
    SET party_id = ?, note = ?, date = ?, start_time = ?, end_time = ?, meet_result = ?, lawyer_id = ?, meeting_type = ?
    WHERE id = ?
  `;
  
  const [result] = await db.query(query, [
    party_id,
    note || null,
    date,
    start_time || null,
    end_time || null,
    meet_result || null,
    lawyer_id || null,
    meeting_type || null,
    id
  ]);
  
  return result.affectedRows > 0;
};

const deleteMeeting = async (id) => {
  const query = 'DELETE FROM meetings WHERE id = ?';
  const [result] = await db.query(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllMeetings,
  getMeetingById,
  getMeetingsByPartyId,
  createMeeting,
  updateMeeting,
  deleteMeeting
};