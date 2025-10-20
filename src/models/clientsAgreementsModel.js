const db = require("../config/db");

const getAllClientsAgreements = async (filters = {}) => {
  const { page = 1, limit = 10, name, phone, status, source } = filters;
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically
  let whereClause = '';
  const params = [];

  const conditions = [];
  
  // Handle name and phone search - if both are provided with same value, use OR logic
  if (name && phone && name === phone) {
    conditions.push('(ca.name LIKE ? OR ca.phone LIKE ?)');
    params.push(`%${name}%`, `%${phone}%`);
  } else {
    if (name) {
      conditions.push('ca.name LIKE ?');
      params.push(`%${name}%`);
    }
    if (phone && phone !== name) {
      conditions.push('ca.phone LIKE ?');
      params.push(`%${phone}%`);
    }
  }
  
  if (status) {
    conditions.push('ca.status = ?');
    params.push(status);
  }
  if (source) {
    conditions.push('ca.source = ?');
    params.push(source);
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Get total count for pagination - use alias in count query too
  const countQuery = `SELECT COUNT(*) as total FROM clients_agreements ca ${whereClause}`;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Get paginated data
  const dataQuery = `
    SELECT ca.*, e.name as created_by_name, b.name_ar as branch_name_ar, b.name_en as branch_name_en
    FROM clients_agreements ca
    LEFT JOIN employees e ON ca.created_by = e.id
    LEFT JOIN branches b ON ca.branch_id = b.id
    ${whereClause} 
    ORDER BY ca.id DESC 
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

const getClientAgreementById = async (id) => {
  const query = `
    SELECT ca.*, e.name as created_by_name, b.name_ar as branch_name_ar, b.name_en as branch_name_en
    FROM clients_agreements ca
    LEFT JOIN employees e ON ca.created_by = e.id
    LEFT JOIN branches b ON ca.branch_id = b.id
    WHERE ca.id = ?
  `;
  const [rows] = await db.query(query, [id]);
  return rows[0];
};

const createClientAgreement = async (data) => {
  const { name, phone, note, created_by, status, source, branch_id, consultation_type, category } = data;
  
  const query = `
    INSERT INTO clients_agreements (name, phone, note, created_by, status, source, branch_id, consultation_type, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await db.query(query, [
    name,
    phone || null,
    note || null,
    created_by || null,
    status || 'جديد',
    source || null,
    branch_id || null,
    consultation_type || null,
    category || null
  ]);
  
  return result.insertId;
};

const updateClientAgreement = async (id, data) => {
  const { name, phone, note, status, source, branch_id, consultation_type, category } = data;
  
  const query = `
    UPDATE clients_agreements 
    SET name = ?, phone = ?, note = ?, status = ?, source = ?, branch_id = ?, consultation_type = ?, category = ?
    WHERE id = ?
  `;
  
  const [result] = await db.query(query, [
    name,
    phone || null,
    note || null,
    status || 'new',
    source || null,
    branch_id || null,
    consultation_type || null,
    category || null,
    id
  ]);
  
  return result.affectedRows > 0;
};

const deleteClientAgreement = async (id) => {
  const query = 'DELETE FROM clients_agreements WHERE id = ?';
  const [result] = await db.query(query, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllClientsAgreements,
  getClientAgreementById,
  createClientAgreement,
  updateClientAgreement,
  deleteClientAgreement
};
