const db = require("../config/db");
const { generateCredentials } = require("../utils/generateCredentials");

const getAllParties = async (filters = {}) => {
  const { page = 1, limit = 10, name, phone, party_type } = filters;
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically
  let whereClause = '';
  const params = [];

  const conditions = [];
  
  // Always filter to show only 'client', 'opponent', and 'vendor' types
  conditions.push("(p.party_type = 'client' OR p.party_type = 'opponent' OR p.party_type = 'vendor')");
  
  if (name) {
    conditions.push('p.name LIKE ?');
    params.push(`%${name}%`);
  }
  if (phone) {
    conditions.push('p.phone LIKE ?');
    params.push(`%${phone}%`);
  }
  if (party_type) {
    conditions.push('p.party_type = ?');
    params.push(party_type);
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM parties p ${whereClause}`;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Get paginated data
  const dataQuery = `
    SELECT p.id, p.name, p.phone, p.category, p.party_type, p.status, p.nationality, p.e_id, p.address, p.consultation_type, p.passport, p.source, p.created_by, p.is_vip,
           b.name_ar AS branch_name
    FROM parties p
    LEFT JOIN branches b ON p.branch_id = b.id
    ${whereClause} 
    ORDER BY p.id DESC 
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

const getPartiesByBranchId = async (branchId) => {
  const [rows] = await db.query(`
    SELECT id, name, phone, category, email, party_type, status, nationality, branch_id, e_id, address, username, consultation_type, passport, source, created_by, is_vip 
    FROM parties 
    WHERE branch_id = ?
  `, [branchId]);
  return rows;
};

const createParty = async (party) => {
  const { name, phone, address, e_id, category, email, party_type, status, nationality, branch_id, consultation_type, passport, source, created_by, is_vip } = party;
  
  // Ensure status is either 'active' or 'inactive', default to 'active'
  const partyStatus = status && ['active', 'inactive'].includes(status) ? status : 'active';
  
  // Handle is_vip, default to 0 (false)
  const vipStatus = is_vip ? 1 : 0;
  
  // Generate unique username and password using utility function
  let username, password;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (!isUnique && attempts < maxAttempts) {
    // Generate credentials using the utility function
    const credentials = await generateCredentials();
    username = credentials.username;
    password = credentials.password;
    
    // Check if username already exists
    const [existingUser] = await db.query(
      'SELECT id FROM parties WHERE username = ?',
      [username]
    );
    
    if (existingUser.length === 0) {
      isUnique = true;
    }
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Failed to generate unique username after multiple attempts');
  }
  
  try {
    const [result] = await db.query(`
      INSERT INTO parties (name, phone, address, e_id, category, email, party_type, username, password, status, nationality, branch_id, consultation_type, passport, source, created_by, is_vip) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, phone, address, e_id, category, email, party_type, username, password, partyStatus, nationality, branch_id, consultation_type, passport, source, created_by, vipStatus]);
    return result.insertId;
  } catch (error) {
    console.error("Error inserting party:", error);
    throw error; // Re-throw to allow proper error handling
  }
};

const deleteParty = async (id) => {
  const [result] = await db.query("DELETE FROM parties WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
const getPartyById = async (id) => {
  const [rows] = await db.query(`
    SELECT p.*, e.name AS created_by_name, b.name_ar AS branch_name_ar, b.name_en AS branch_name_en 
    FROM parties p 
    LEFT JOIN employees e ON p.created_by = e.id 
    LEFT JOIN branches b ON p.branch_id = b.id
    WHERE p.id = ?
  `, [id]);
  return rows[0];
}
const updateParty = async (id, party) => {
  const { name, phone, address, category, email, party_type, username, password, status, nationality, branch_id, e_id, consultation_type, passport, source, is_vip } = party;
  
  // Ensure status is either 'active' or 'inactive', default to 'active'
  const partyStatus = status && ['active', 'inactive'].includes(status) ? status : 'active';
  
  // Build dynamic update query based on provided fields
  const updates = [];
  const params = [];
  
  if (name !== undefined) {
    updates.push('name = ?');
    params.push(name);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    params.push(phone);
  }
  if (address !== undefined) {
    updates.push('address = ?');
    params.push(address);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category);
  }
  if (email !== undefined) {
    updates.push('email = ?');
    params.push(email);
  }
  if (party_type !== undefined) {
    updates.push('party_type = ?');
    params.push(party_type);
  }
  if (username !== undefined) {
    updates.push('username = ?');
    params.push(username);
  }
  if (password !== undefined) {
    updates.push('password = ?');
    params.push(password);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(partyStatus);
  }
  if (nationality !== undefined) {
    updates.push('nationality = ?');
    params.push(nationality);
  }
  if (branch_id !== undefined) {
    updates.push('branch_id = ?');
    params.push(branch_id);
  }
  if (e_id !== undefined) {
    updates.push('e_id = ?');
    params.push(e_id);
  }
  if (consultation_type !== undefined) {
    updates.push('consultation_type = ?');
    params.push(consultation_type);
  }
  if (passport !== undefined) {
    updates.push('passport = ?');
    params.push(passport);
  }
  if (source !== undefined) {
    updates.push('source = ?');
    params.push(source);
  }
  if (is_vip !== undefined) {
    updates.push('is_vip = ?');
    params.push(is_vip ? 1 : 0);
  }
  
  // If no fields to update, return false
  if (updates.length === 0) {
    return false;
  }
  
  params.push(id); // Add id at the end for WHERE clause
  
  const query = `UPDATE parties SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await db.query(query, params);
  return result.affectedRows > 0;
};

const addPartyDocument = async (party_id, document_name, document_url, uploaded_by = null) => {
  try {
    const [result] = await db.query(`
      INSERT INTO parties_documents (party_id, document_name, document_url, uploaded_by)
      VALUES (?, ?, ?, ?)
    `, [party_id, document_name, document_url, uploaded_by]);
    return result.insertId;
  } catch (error) {
    console.error("Error inserting party document:", error);
    throw error;
  }
};
 
const getPartyDocuments= async (partyId) => {
  const [rows] = await db.query("SELECT pd.id, pd.document_name, pd.document_url, e.name AS uploaded_by_name FROM parties_documents pd LEFT JOIN employees e ON pd.uploaded_by = e.id WHERE pd.party_id = ?", [partyId]);
  return rows;
}

const getPotentialClients = async (filters = {}) => {
  const { page = 1, limit = 10, name, phone, party_type } = filters;
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically
  let whereClause = 'WHERE party_type NOT IN (?, ?)';
  const params = ['client', 'opponent'];

  const conditions = [];
  if (name) {
    conditions.push('name LIKE ?');
    params.push(`%${name}%`);
  }
  if (phone) {
    conditions.push('phone LIKE ?');
    params.push(`%${phone}%`);
  }
  if (party_type) {
    conditions.push('party_type = ?');
    params.push(party_type);
  }

  if (conditions.length > 0) {
    whereClause += ' AND ' + conditions.join(' AND ');
  }

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM parties ${whereClause}`;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Get paginated data with joins for source name and created_by name
  const dataQuery = `
    SELECT 
      p.id, 
      p.name, 
      p.phone, 
      p.source, 
      p.category, 
      p.party_type, 
      p.status, 
      p.nationality, 
      p.e_id, 
      p.address, 
      p.consultation_type, 
      p.passport, 
      p.created_by,
      p.is_vip,
      e.name as created_by_name
    FROM parties p
    LEFT JOIN employees e ON p.created_by = e.id 
    ${whereClause} 
    ORDER BY p.id DESC 
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

const searchParties = async (query, partyType = null) => {
  // Search by name or phone, return maximum 10 results
  const searchPattern = `%${query}%`;
  
  // Build the party_type filter
  // Include all party types: clients, opponents, and potential clients (New, Contacted, Unqualified, Qualified)
  let partyTypeCondition = "(party_type = 'client' OR party_type = 'opponent' OR party_type = 'vendor' OR party_type = 'New' OR party_type = 'Contacted' OR party_type = 'Unqualified' OR party_type = 'Qualified')";
  const params = [searchPattern, searchPattern];
  
  if (partyType === 'client') {
    partyTypeCondition = "party_type = 'client'";
  } else if (partyType === 'opponent') {
    partyTypeCondition = "party_type = 'opponent'";
  } else if (partyType === 'vendor') {
    partyTypeCondition = "party_type = 'vendor'";
  } else if (partyType === 'potential') {
    // For potential clients, include all non-client/opponent/vendor types
    partyTypeCondition = "(party_type = 'New' OR party_type = 'Contacted' OR party_type = 'Unqualified' OR party_type = 'Qualified')";
  }
  
  const [rows] = await db.query(`
    SELECT id, name, phone, category, party_type, status, nationality, e_id, address, is_vip 
    FROM parties 
    WHERE (name LIKE ? OR phone LIKE ?) 
      AND ${partyTypeCondition}
    ORDER BY 
      CASE 
        WHEN name LIKE ? THEN 1
        WHEN phone LIKE ? THEN 2
        ELSE 3
      END,
      party_type DESC,
      name ASC
    LIMIT 10
  `, [...params, `${query}%`, `${query}%`]);
  
  return rows;
};

const getPartyByUsername = async (username) => {
  const [rows] = await db.query(`
    SELECT * FROM parties WHERE username = ?
  `, [username]);
  return rows[0];
};

const checkDuplicateParty = async (name, phone, email = null, excludeId = null) => {
  const duplicates = {
    name: null,
    phone: null,
    email: null
  };
  
  // Check for duplicate name (only if name is provided and not empty)
  if (name && name.trim()) {
    const nameQuery = `
      SELECT id, name 
      FROM parties 
      WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))
      ${excludeId ? 'AND id != ?' : ''}
      LIMIT 1
    `;
    const nameParams = excludeId ? [name, excludeId] : [name];
    const [nameRows] = await db.query(nameQuery, nameParams);
    
    if (nameRows && nameRows[0]) {
      duplicates.name = nameRows[0];
    }
  }
  
  // Check for duplicate phone (only if phone is provided and not empty)
  if (phone && phone.trim()) {
    const phoneQuery = `
      SELECT id, phone 
      FROM parties 
      WHERE TRIM(phone) = TRIM(?)
      ${excludeId ? 'AND id != ?' : ''}
      LIMIT 1
    `;
    const phoneParams = excludeId ? [phone, excludeId] : [phone];
    const [phoneRows] = await db.query(phoneQuery, phoneParams);
    
    if (phoneRows && phoneRows[0]) {
      duplicates.phone = phoneRows[0];
    }
  }
  
  // Check for duplicate email (only if email is provided and not empty)
  if (email && email.trim()) {
    const emailQuery = `
      SELECT id, email 
      FROM parties 
      WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
      ${excludeId ? 'AND id != ?' : ''}
      LIMIT 1
    `;
    const emailParams = excludeId ? [email, excludeId] : [email];
    const [emailRows] = await db.query(emailQuery, emailParams);
    
    if (emailRows && emailRows[0]) {
      duplicates.email = emailRows[0];
    }
  }
  
  return duplicates;
};

const getClientsForFinance = async (filters = {}) => {
  const { page = 1, limit = 20, search } = filters;
  const offset = (page - 1) * limit;

  let whereClause = "WHERE p.party_type != 'opponent'";
  const params = [];
  const searchParam = search ? `%${search}%` : null;

  if (search) {
    whereClause += " AND (p.name LIKE ? OR p.phone LIKE ? OR p.nationality LIKE ?)";
    params.push(searchParam, searchParam, searchParam);
  }

  const query = `
    SELECT 
      p.id,
      p.name,
      p.phone,
      p.nationality,
      p.balance
    FROM parties p
    ${whereClause}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const [rows] = await db.query(query, params);

  // Get total count
  const countQuery = `
    SELECT COUNT(*) as total
    FROM parties p
    ${whereClause}
  `;
  const countParams = search ? [searchParam, searchParam, searchParam] : [];
  const [countResult] = await db.query(countQuery, countParams);

  return {
    data: rows,
    total: countResult[0].total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(countResult[0].total / limit)
  };
};

module.exports = {
  getAllParties,
  getPartiesByBranchId,
  createParty,
  deleteParty,
  addPartyDocument,
  getPartyById,
  updateParty,
  getPartyDocuments,
  getPotentialClients,
  searchParties,
  getPartyByUsername,
  checkDuplicateParty,
  getClientsForFinance
};
