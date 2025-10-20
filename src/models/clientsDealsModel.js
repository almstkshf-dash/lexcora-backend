const db = require("../config/db");

const getAllClientsDeals = async (filters = {}) => {
  const { page = 1, limit = 10, client_id, type, status, created_by, start_date, end_date } = filters;
  const offset = (page - 1) * limit;

  // Build WHERE clause dynamically
  let whereClause = '';
  const params = [];

  const conditions = [];
  if (client_id) {
    conditions.push('cd.client_id = ?');
    params.push(client_id);
  }
  if (type) {
    conditions.push('cd.type = ?');
    params.push(type);
  }
  if (status) {
    conditions.push('cd.status = ?');
    params.push(status);
  }
  if (created_by) {
    conditions.push('cd.created_by = ?');
    params.push(created_by);
  }
  if (start_date) {
    conditions.push('cd.start_date >= ?');
    params.push(start_date);
  }
  if (end_date) {
    conditions.push('cd.end_date <= ?');
    params.push(end_date);
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Get total count for pagination
  const countQuery = `SELECT COUNT(*) as total FROM clients_deals cd ${whereClause}`;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Get paginated data with related information
  const dataQuery = `
    SELECT cd.*, 
           p.name as client_name,
           p.phone as client_phone,
           e.name as created_by_name
    FROM clients_deals cd
    LEFT JOIN parties p ON cd.client_id = p.id
    LEFT JOIN employees e ON cd.created_by = e.id
    ${whereClause} 
    ORDER BY cd.created_at DESC 
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

const getClientDealById = async (id) => {
  const query = `
    SELECT cd.*, 
           p.name as client_name,
           p.phone as client_phone,
           e.name as created_by_name
    FROM clients_deals cd
    LEFT JOIN parties p ON cd.client_id = p.id
    LEFT JOIN employees e ON cd.created_by = e.id
    WHERE cd.id = ?
  `;
  const [rows] = await db.query(query, [id]);
  return rows[0];
};

const getClientDealsByClientId = async (clientId) => {
  const query = `
    SELECT cd.*, 
           p.name as client_name,
           p.phone as client_phone,
           e.name as created_by_name
    FROM clients_deals cd
    LEFT JOIN parties p ON cd.client_id = p.id
    LEFT JOIN employees e ON cd.created_by = e.id
    WHERE cd.client_id = ?
    ORDER BY cd.created_at DESC
  `;
  const [rows] = await db.query(query, [clientId]);
  return rows;
};

const createClientDeal = async (data) => {
  const { client_id, amount, type, status, start_date, end_date, created_by } = data;
  
  const query = `
    INSERT INTO clients_deals (client_id, amount, type, status, start_date, end_date, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  const [result] = await db.query(query, [
    client_id,
    amount,
    type || 'normal',
    status || 'draft',
    start_date || null,
    end_date || null,
    created_by || null
  ]);
  
  return result.insertId;
};

const updateClientDeal = async (id, data) => {
  const { client_id, amount, type, status, start_date, end_date } = data;
  
  const query = `
    UPDATE clients_deals 
    SET client_id = ?, amount = ?, type = ?, status = ?, start_date = ?, end_date = ?
    WHERE id = ?
  `;
  
  const [result] = await db.query(query, [
    client_id,
    amount,
    type || 'normal',
    status || 'draft',
    start_date || null,
    end_date || null,
    id
  ]);
  
  return result.affectedRows > 0;
};

const deleteClientDeal = async (id) => {
  const query = 'DELETE FROM clients_deals WHERE id = ?';
  const [result] = await db.query(query, [id]);
  return result.affectedRows > 0;
};

// ============================================
// DEAL DOCUMENTS FUNCTIONS
// ============================================

const getDealDocuments = async (dealId) => {
  const query = `
    SELECT dd.*, e.name as created_by_name
    FROM deal_documents dd
    LEFT JOIN employees e ON dd.created_by = e.id
    WHERE dd.deal_id = ?
    ORDER BY dd.created_at DESC
  `;
  const [rows] = await db.query(query, [dealId]);
  return rows;
};

const createDealDocument = async (data) => {
  const { deal_id, document_name, document_url, created_by } = data;
  
  const query = `
    INSERT INTO deal_documents (deal_id, document_name, document_url, created_by)
    VALUES (?, ?, ?, ?)
  `;
  
  const [result] = await db.query(query, [
    deal_id,
    document_name,
    document_url,
    created_by || null
  ]);
  
  return result.insertId;
};

const createDealDocuments = async (documents) => {
  if (!documents || documents.length === 0) return [];
  
  const query = `
    INSERT INTO deal_documents (deal_id, document_name, document_url, created_by)
    VALUES ?
  `;
  
  const values = documents.map(doc => [
    doc.deal_id,
    doc.document_name,
    doc.document_url,
    doc.created_by || null
  ]);
  
  const [result] = await db.query(query, [values]);
  return result.insertId;
};

const deleteDealDocument = async (documentId) => {
  const query = 'DELETE FROM deal_documents WHERE id = ?';
  const [result] = await db.query(query, [documentId]);
  return result.affectedRows > 0;
};

const deleteDealDocuments = async (dealId) => {
  const query = 'DELETE FROM deal_documents WHERE deal_id = ?';
  const [result] = await db.query(query, [dealId]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllClientsDeals,
  getClientDealById,
  getClientDealsByClientId,
  createClientDeal,
  updateClientDeal,
  deleteClientDeal,
  getDealDocuments,
  createDealDocument,
  createDealDocuments,
  deleteDealDocument,
  deleteDealDocuments
};