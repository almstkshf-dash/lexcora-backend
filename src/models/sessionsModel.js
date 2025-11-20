const db = require("../config/db");

const getAllSessions = async (filters = {}, limit = 50, offset = 0, sortBy = 'session_date', sortOrder = 'DESC') => {
  let query = `
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
      c.branch_id,
      courts.court_ar,
      courts.court_en,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'opponent' THEN p.name END ORDER BY p.name SEPARATOR ', ') as opponent_parties
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    LEFT JOIN courts ON c.court_id = courts.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    LEFT JOIN parties p ON cp.party_id = p.id
  `;
  
  const conditions = [];
  const params = [];
  
  // Apply filters
  if (filters.branchId) {
    conditions.push('c.branch_id = ?');
    params.push(filters.branchId);
  }
  
  if (filters.fileNumber) {
    conditions.push('c.file_number LIKE ?');
    params.push(`%${filters.fileNumber}%`);
  }
  
  if (filters.caseNumber) {
    conditions.push('c.case_number LIKE ?');
    params.push(`%${filters.caseNumber}%`);
  }
  
  if (filters.fromDate) {
    conditions.push('DATE(s.session_date) >= ?');
    params.push(filters.fromDate);
  }
  
  if (filters.toDate) {
    conditions.push('DATE(s.session_date) <= ?');
    params.push(filters.toDate);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  const allowedSort = ['session_date', 'created_at', 'id'];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : 'session_date';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  query += `
    GROUP BY s.id, s.case_id, s.session_date, s.link, s.is_expert_session, s.note, s.created_at, s.updated_at, c.case_number, c.file_number, c.topic, c.branch_id, courts.court_ar, courts.court_en
    ORDER BY s.${orderBy} ${orderDir}
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  
  const [rows] = await db.query(query, params);
  
  // Convert comma-separated strings to arrays and handle null values
  const data = rows.map(row => ({
    ...row,
    clientParties: row.client_parties ? row.client_parties.split(', ') : [],
    opponentParties: row.opponent_parties ? row.opponent_parties.split(', ') : [],
    client_parties: undefined, // Remove the original field
    opponent_parties: undefined // Remove the original field
  }));

  const { total } = await getSessionsCount(filters);
  return { rows: data, total };
};

const getSessionsCount = async (filters = {}) => {
  let query = `
    SELECT COUNT(DISTINCT s.id) as total
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
  `;
  
  const conditions = [];
  const params = [];
  
  // Apply same filters as getAllSessions
  if (filters.branchId) {
    conditions.push('c.branch_id = ?');
    params.push(filters.branchId);
  }
  
  if (filters.fileNumber) {
    conditions.push('c.file_number LIKE ?');
    params.push(`%${filters.fileNumber}%`);
  }
  
  if (filters.caseNumber) {
    conditions.push('c.case_number LIKE ?');
    params.push(`%${filters.caseNumber}%`);
  }
  
  if (filters.fromDate) {
    conditions.push('DATE(s.session_date) >= ?');
    params.push(filters.fromDate);
  }
  
  if (filters.toDate) {
    conditions.push('DATE(s.session_date) <= ?');
    params.push(filters.toDate);
  }
  
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  const [rows] = await db.query(query, params);
  return rows[0].total;
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
      s.has_ruling,
      s.ruling,
      s.ruling_date,
      s.legal_period_id,
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
    GROUP BY s.id, s.case_id, s.session_date, s.link, s.is_expert_session, s.note, s.has_ruling, s.ruling, s.ruling_date, s.legal_period_id, s.created_at, s.updated_at, c.case_number, c.file_number, c.topic, courts.court_ar, courts.court_en
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
  const { case_id , decision=null, session_date , link=null, is_expert_session=0, note, has_ruling=0, ruling=null, ruling_date=null, legal_period_id=null } = session;
  const [result] = await db.query(`
    INSERT INTO sessions (case_id , decision, session_date , link, is_expert_session, note, has_ruling, ruling, ruling_date, legal_period_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [case_id , decision, session_date , link, is_expert_session, note, has_ruling, ruling, ruling_date, legal_period_id]);
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
  const { decision=null, session_date, link, is_expert_session, is_judgment_reserved, is_judgment_deferred, note, status, has_ruling=0, ruling=null, ruling_date=null, legal_period_id=null } = session;
  const [result] = await db.query(`
    UPDATE sessions 
    SET decision = ?, session_date = ?, link = ?, is_expert_session = ?, is_judgment_reserved = ?, is_judgment_deferred = ?, note = ?, status = ?, has_ruling = ?, ruling = ?, ruling_date = ?, legal_period_id = ?
    WHERE id = ?
  `, [decision, session_date, link, is_expert_session, is_judgment_reserved, is_judgment_deferred, note, status, has_ruling, ruling, ruling_date, legal_period_id, id]);
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
      has_ruling,
      ruling,
      ruling_date,
      legal_period_id,
      created_at
    FROM sessions 
    WHERE case_id = ?
  `, [caseId]);
  
  return rows; 
};

// Appeals and Cassations methods
const addAppealCassation = async (session_id, legal_period_id) => {
  const [result] = await db.query(`
    INSERT INTO appeals_cassations (session_id, legal_period_id) 
    VALUES (?, ?)
  `, [session_id, legal_period_id]);
  return result.insertId;
};

const getAppealCassationBySessionId = async (session_id) => {
  const [rows] = await db.query(`
    SELECT * FROM appeals_cassations WHERE session_id = ?
  `, [session_id]);
  return rows.length > 0 ? rows[0] : null;
};

const updateAppealCassation = async (session_id, legal_period_id) => {
  const [result] = await db.query(`
    UPDATE appeals_cassations 
    SET legal_period_id = ? 
    WHERE session_id = ?
  `, [legal_period_id, session_id]);
  return result.affectedRows > 0;
};

const deleteAppealCassationBySessionId = async (session_id) => {
  const [result] = await db.query(`
    DELETE FROM appeals_cassations WHERE session_id = ?
  `, [session_id]);
  return result.affectedRows > 0;
};

// Get sessions with rulings (حكم) for appeals and challenges
const getAppealsAndChallenges = async () => {
  const [rows] = await db.query(`
    SELECT 
      s.id,
      s.case_id,
      s.session_date,
      s.ruling,
      c.case_number,
      c.file_number,
      c.topic,
      lp.objection_days,
      lp.appeal_days,
      lp.cassation_days,
      lp.name as legal_period_name,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      -- Calculate objection end date
      CASE 
        WHEN lp.objection_days IS NOT NULL AND lp.objection_days > 0 
        THEN DATE_ADD(s.session_date, INTERVAL lp.objection_days DAY)
        ELSE NULL
      END as objection_end_date,
      -- Calculate appeal end date
      CASE 
        WHEN lp.appeal_days IS NOT NULL AND lp.appeal_days > 0 
        THEN DATE_ADD(s.session_date, INTERVAL lp.appeal_days DAY)
        ELSE NULL
      END as appeal_end_date,
      -- Calculate cassation end date
      CASE 
        WHEN lp.cassation_days IS NOT NULL AND lp.cassation_days > 0 
        THEN DATE_ADD(s.session_date, INTERVAL lp.cassation_days DAY)
        ELSE NULL
      END as cassation_end_date,
      -- Flags for what's available
      CASE 
        WHEN lp.objection_days IS NOT NULL AND lp.objection_days > 0 
        THEN true 
        ELSE false 
      END as has_objection,
      CASE 
        WHEN lp.appeal_days IS NOT NULL AND lp.appeal_days > 0 
        THEN true 
        ELSE false 
      END as has_appeal,
      CASE 
        WHEN lp.cassation_days IS NOT NULL AND lp.cassation_days > 0 
        THEN true 
        ELSE false 
      END as has_cassation
    FROM sessions s
    INNER JOIN cases c ON s.case_id = c.id
    INNER JOIN (
      SELECT case_id, MAX(session_date) as max_date
      FROM sessions
      WHERE has_ruling = 1 AND status = 'active'
      GROUP BY case_id
    ) latest ON s.case_id = latest.case_id AND s.session_date = latest.max_date
    LEFT JOIN appeals_cassations ac ON s.id = ac.session_id
    LEFT JOIN legal_periods lp ON ac.legal_period_id = lp.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id AND cp.type = 'client'
    LEFT JOIN parties p ON cp.party_id = p.id
    WHERE s.has_ruling = 1 AND s.status = 'active'
    GROUP BY s.id, s.case_id, s.session_date, s.ruling, c.case_number, c.file_number, c.topic, 
             lp.objection_days, lp.appeal_days, lp.cassation_days, lp.name
    ORDER BY s.session_date DESC
  `);
  
  // Convert comma-separated strings to arrays and handle null values
  return rows.map(row => ({
    ...row,
    clientParties: row.client_parties ? row.client_parties.split(', ') : [],
    client_parties: undefined, // Remove the original field
    has_objection: Boolean(row.has_objection),
    has_appeal: Boolean(row.has_appeal),
    has_cassation: Boolean(row.has_cassation)
  }));
};

// Get judicial decisions (sessions with has_ruling = 1 or ruling field is not null)
const getJudicialDecisions = async (filters = {}, limit = 50, offset = 0) => {
  let query = `
    SELECT 
      s.id,
      s.case_id,
      s.session_date,
      s.link,
      s.decision,
      s.ruling,
      s.has_ruling,
      s.note,
      s.created_at,
      s.updated_at,
      c.case_number,
      c.file_number,
      c.topic as case_topic,
      c.branch_id,
      courts.court_ar,
      courts.court_en,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'client' THEN p.name END ORDER BY p.name SEPARATOR ', ') as client_parties,
      GROUP_CONCAT(DISTINCT CASE WHEN cp.type = 'opponent' THEN p.name END ORDER BY p.name SEPARATOR ', ') as opponent_parties
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    LEFT JOIN courts ON c.court_id = courts.id
    LEFT JOIN case_parties cp ON c.id = cp.case_id
    LEFT JOIN parties p ON cp.party_id = p.id
    WHERE (s.has_ruling = 1 OR s.ruling IS NOT NULL) AND s.status = 'active'
  `;
  
  const params = [];
  
  // Apply filters
  if (filters.branchId) {
    query += ' AND c.branch_id = ?';
    params.push(filters.branchId);
  }
  
  if (filters.fileNumber) {
    query += ' AND c.file_number LIKE ?';
    params.push(`%${filters.fileNumber}%`);
  }
  
  if (filters.caseNumber) {
    query += ' AND c.case_number LIKE ?';
    params.push(`%${filters.caseNumber}%`);
  }
  
  if (filters.fromDate) {
    query += ' AND DATE(s.session_date) >= ?';
    params.push(filters.fromDate);
  }
  
  if (filters.toDate) {
    query += ' AND DATE(s.session_date) <= ?';
    params.push(filters.toDate);
  }
  
  query += `
    GROUP BY s.id, s.case_id, s.session_date, s.link, s.decision, s.ruling, s.has_ruling, s.note, s.created_at, s.updated_at, c.case_number, c.file_number, c.topic, c.branch_id, courts.court_ar, courts.court_en
    ORDER BY s.session_date DESC
    LIMIT ? OFFSET ?
  `;
  
  params.push(limit, offset);
  
  const [rows] = await db.query(query, params);
  
  // Convert comma-separated strings to arrays and handle null values
  return rows.map(row => ({
    ...row,
    clientParties: row.client_parties ? row.client_parties.split(', ') : [],
    opponentParties: row.opponent_parties ? row.opponent_parties.split(', ') : [],
    client_parties: undefined, // Remove the original field
    opponent_parties: undefined // Remove the original field
  }));
};

const getJudicialDecisionsCount = async (filters = {}) => {
  let query = `
    SELECT COUNT(DISTINCT s.id) as total
    FROM sessions s
    LEFT JOIN cases c ON s.case_id = c.id
    WHERE (s.has_ruling = 1 OR s.ruling IS NOT NULL) AND s.status = 'active'
  `;
  
  const params = [];
  
  // Apply same filters
  if (filters.branchId) {
    query += ' AND c.branch_id = ?';
    params.push(filters.branchId);
  }
  
  if (filters.fileNumber) {
    query += ' AND c.file_number LIKE ?';
    params.push(`%${filters.fileNumber}%`);
  }
  
  if (filters.caseNumber) {
    query += ' AND c.case_number LIKE ?';
    params.push(`%${filters.caseNumber}%`);
  }
  
  if (filters.fromDate) {
    query += ' AND DATE(s.session_date) >= ?';
    params.push(filters.fromDate);
  }
  
  if (filters.toDate) {
    query += ' AND DATE(s.session_date) <= ?';
    params.push(filters.toDate);
  }
  
  const [rows] = await db.query(query, params);
  return rows[0].total;
};

module.exports = {
  getAllSessions,
  getSessionsCount,
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
  getSessionsByCase,
  addAppealCassation,
  getAppealCassationBySessionId,
  updateAppealCassation,
  deleteAppealCassationBySessionId,
  getAppealsAndChallenges,
  getJudicialDecisions,
  getJudicialDecisionsCount
};
