const db = require("../config/db");

const getAllSessions = async () => {
  const [rows] = await db.query(`
    SELECT 
      s.id,
      s.case_id,
      s.session_date,
      s.link,
      s.is_judgment_reserved,
      s.is_judgment_deferred,
      s.decision,
      s.is_expert_session as is_expert_session,
      s.note,
      s.created_at,
      s.updated_at,
      c.case_number,
      c.file_number,
      c.topic as case_topic,
      courts.court_ar,
      courts.court_en,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'opponent' THEN p.name END ORDER BY p.name SEPARATOR ', ') as opponent_parties
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    LEFT JOIN courts ON c.court_id = courts.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    LEFT JOIN parties p ON cp.party_id = p.id
    GROUP BY s.id, s.case_id, s.session_date, s.link, s.is_expert_session, s.note, s.created_at, s.updated_at, c.case_number, c.file_number, c.topic, courts.court_ar, courts.court_en
    ORDER BY s.session_date DESC
  `);
  
  // Convert comma-separated strings to arrays and handle null values
  return rows.map(row => ({
    ...row,
    clientParties: row.client_parties ? row.client_parties.split(', ') : [],
    opponentParties: row.opponent_parties ? row.opponent_parties.split(', ') : [],
    client_parties: undefined, // Remove the original field
    opponent_parties: undefined // Remove the original field
  }));
};

const getSessionById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      s.id,
      s.case_id,
      s.session_date,
      s.link,
      s.is_judgment_reserved,
      s.is_judgment_deferred,
      s.decision,
      s.is_expert_session as is_expert_session,
      s.note,
      s.status,
      s.created_at,
      s.updated_at,
      c.case_number,
      c.file_number,
      c.topic as case_topic,
      courts.court_ar,
      courts.court_en,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'opponent' THEN p.name END ORDER BY p.name SEPARATOR ', ') as opponent_parties
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    LEFT JOIN courts ON c.court_id = courts.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    LEFT JOIN parties p ON cp.party_id = p.id
    WHERE s.id = ?
    GROUP BY s.id, s.case_id, s.session_date, s.link, s.is_expert_session, s.note, s.created_at, s.updated_at, c.case_number, c.file_number, c.topic, courts.court_ar, courts.court_en
  `, [id]);
  
  if (rows.length === 0) {
    return null;
  }
  
  // Get session documents
  const [docRows] = await db.query(`
    SELECT 
      id,
      session_id,
      document_name,
      document_url,
      created_at,
      uploaded_by
    FROM session_documents 
    WHERE session_id = ?
    ORDER BY created_at DESC
  `, [id]);
  
  // Convert comma-separated strings to arrays and handle null values
  const session = rows[0];
  return {
    ...session,
    clientParties: session.client_parties ? session.client_parties.split(', ') : [],
    opponentParties: session.opponent_parties ? session.opponent_parties.split(', ') : [],
    documents: docRows || [],
    client_parties: undefined, // Remove the original field
    opponent_parties: undefined // Remove the original field
  };
};

const getSessionsWithDecision = async () => {
  const [rows] = await db.query(`
    SELECT 
      s.id,
      s.case_id,
      s.session_date,
      s.decision,
      c.case_number,
      c.file_number,
      c.topic ,
      ct.name_en as case_type_en,
      ct.name_ar as case_type_ar,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'opponent' THEN p.name END ORDER BY p.name SEPARATOR ', ') as opponent_parties,
      COALESCE(latest_degree.degree, false) as degree
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    LEFT JOIN case_types ct ON c.case_type_id = ct.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    LEFT JOIN parties p ON cp.party_id = p.id
    LEFT JOIN (
      SELECT 
        cd1.case_id,
        cd1.degree
      FROM case_degrees cd1
      INNER JOIN (
        SELECT case_id, MAX(id) as max_id
        FROM case_degrees
        GROUP BY case_id
      ) cd2 ON cd1.case_id = cd2.case_id AND cd1.id = cd2.max_id
    ) latest_degree ON c.id = latest_degree.case_id
    WHERE s.decision IS NOT NULL AND s.decision != '' AND s.status = 'active'
    GROUP BY s.id, s.case_id, s.session_date, s.decision, s.note, c.case_number, c.file_number, c.topic, ct.name_ar, ct.name_en, latest_degree.degree
    ORDER BY s.session_date DESC
  `);
  
  // Convert comma-separated strings to arrays and handle null values
  return rows.map(row => ({
    ...row,
    clientParties: row.client_parties ? row.client_parties.split(', ') : [],
    opponentParties: row.opponent_parties ? row.opponent_parties.split(', ') : [],
    client_parties: undefined, // Remove the original field
    opponent_parties: undefined // Remove the original field
  }));
};

const getSessionsWithNoDecision = async () => {
  const [rows] = await db.query(`
    SELECT 
      s.id,
      s.case_id,
      s.session_date,
      s.decision,
      s.is_judgment_reserved,
      s.is_judgment_deferred, 
      c.case_number,
      c.file_number,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      COALESCE(latest_degree.degree, false) as degree
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    LEFT JOIN parties p ON cp.party_id = p.id
    LEFT JOIN (
      SELECT 
        cd1.case_id,
        cd1.degree
      FROM case_degrees cd1
      INNER JOIN (
        SELECT case_id, MAX(id) as max_id
        FROM case_degrees
        GROUP BY case_id
      ) cd2 ON cd1.case_id = cd2.case_id AND cd1.id = cd2.max_id
    ) latest_degree ON c.id = latest_degree.case_id
    WHERE (s.decision IS NULL OR s.decision = '') AND CURDATE() >=  DATE(s.session_date) AND s.status = 'active'
    GROUP BY s.id, s.case_id, s.session_date, s.decision, c.case_number, c.file_number, latest_degree.degree
    ORDER BY s.session_date DESC
  `);
  
  // Convert comma-separated strings to arrays and handle null values
  return rows.map(row => ({
    ...row,
    clientParties: row.client_parties ? row.client_parties.split(', ') : [],
    client_parties: undefined // Remove the original field
  }));
};
 const getSessionsInThisWeek = async () => {
  const [rows] = await db.query(`
    SELECT 
      s.id,
      s.case_id,
      s.session_date,
      s.decision,
      s.decision,
      c.case_number,
      c.case_number,
      c.file_number,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      COALESCE(latest_degree.degree, false) as degree
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    LEFT JOIN parties p ON cp.party_id = p.id
    LEFT JOIN (
      SELECT 
        cd1.case_id,
        cd1.degree
      FROM case_degrees cd1
      INNER JOIN (
        SELECT case_id, MAX(id) as max_id
        FROM case_degrees
        GROUP BY case_id
      ) cd2 ON cd1.case_id = cd2.case_id AND cd1.id = cd2.max_id
    ) latest_degree ON c.id = latest_degree.case_id
    GROUP BY s.id, s.case_id, s.session_date, s.link, s.is_judgment_reserved, s.is_judgment_deferred, s.decision, s.is_expert_session, s.note, s.created_at, s.updated_at, c.case_number, c.file_number, latest_degree.degree
    ORDER BY s.session_date DESC
  `);
  
  // Convert comma-separated strings to arrays and handle null values
  return rows.map(row => ({
    ...row,
    clientParties: row.client_parties ? row.client_parties.split(', ') : [],
    client_parties: undefined // Remove the original field
  }));
};

const createSession = async (session) => {
  const { case_id , decision=null, session_date , link=null, is_expert_session=0, note } = session;
  const [result] = await db.query(`
    INSERT INTO sessions (case_id , decision, session_date , link, is_expert_session, note) VALUES (?, ?, ?, ?, ?, ?)
  `, [case_id , decision, session_date , link, is_expert_session, note]);
  return result.insertId;
};
const addSessionDocument = async (session_id, document_name, document_url) => {
  const [result] = await db.query(`
    INSERT INTO session_documents (session_id, document_name, document_url) VALUES (?, ?, ?)
  `, [session_id, document_name, document_url]);
  return result.insertId;
};

const getSessionDocuments = async (sessionId) => {
  const [rows] = await db.query(`
    SELECT 
      id,
      session_id,
      document_name,
      document_url,
      created_at,
      uploaded_by
    FROM session_documents 
    WHERE session_id = ?
    ORDER BY created_at DESC
  `, [sessionId]);
  return rows;
};

const deleteSessionDocument = async (documentId, sessionId) => {
  const [result] = await db.query(
    "DELETE FROM session_documents WHERE id = ? AND session_id = ?", 
    [documentId, sessionId]
  );
  return result.affectedRows > 0;
};

const updateSession = async (id, session) => {
  const { decision=null, session_date, link, is_expert_session, is_judgment_reserved, is_judgment_deferred, note,status } = session;
  const [result] = await db.query(`
    UPDATE sessions SET decision = ?, session_date = ?, link = ?, is_expert_session = ?, is_judgment_reserved = ?, is_judgment_deferred = ?, note = ?, status = ? WHERE id = ?
  `, [decision, session_date, link, is_expert_session, is_judgment_reserved, is_judgment_deferred, note, status, id]);
  return result.affectedRows > 0;
};

const deleteSession = async (id) => {
  const [result] = await db.query("DELETE FROM sessions WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getSessionsByCase = async (caseId) => {
  const [rows] = await db.query(`
    SELECT 
      id,
      case_id,
      session_date,
      link,
      is_judgment_reserved,
      is_judgment_deferred,
      decision,
      is_expert_session as is_expert_session,
      note,
      created_at
    FROM sessions 
    WHERE case_id = ?
  `, [caseId]);
  
  return rows; 
};

module.exports = {
  getAllSessions,
  getSessionById,
  createSession,
  updateSession,
  addSessionDocument,
  getSessionDocuments,
  deleteSessionDocument,
  deleteSession,
  getSessionsWithNoDecision,
  getSessionsInThisWeek,
  getSessionsWithDecision,
  getSessionsByCase
};
