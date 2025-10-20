const db = require("../config/db");

const getAllPartiesOrders = async (filters = {}) => {
  const { page = 1, limit = 10, party_id, status, type, search } = filters;
  
  // Convert page and limit to integers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  // Build WHERE clause dynamically
  let whereClause = '';
  const params = [];
  const conditions = [];

  if (party_id) {
    conditions.push('po.party_id = ?');
    params.push(party_id);
  }
  if (status) {
    conditions.push('po.status = ?');
    params.push(status);
  }
  if (type) {
    conditions.push('po.type LIKE ?');
    params.push(`%${type}%`);
  }
  if (search) {
    conditions.push('(p.name LIKE ? OR p.phone LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    whereClause = 'WHERE ' + conditions.join(' AND ');
  }

  // Get total count for pagination - need to join parties table if searching
  const countQuery = `
    SELECT COUNT(*) as total 
    FROM parties_orders po 
    LEFT JOIN parties p ON po.party_id = p.id
    ${whereClause}
  `;
  const [countResult] = await db.query(countQuery, params);
  const total = countResult[0].total;

  // Get paginated data with joins
  const dataQuery = `
    SELECT 
      po.id,
      po.party_id,
      po.type,
      po.date,
      po.status,
      po.case_number,
      po.details,
      po.created_at,
      po.created_by,
      p.name AS party_name,
      p.phone AS party_phone,
      e.name AS created_by_name
    FROM parties_orders po
    LEFT JOIN parties p ON po.party_id = p.id
    LEFT JOIN employees e ON po.created_by = e.id
    ${whereClause}
    ORDER BY po.id DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await db.query(dataQuery, [...params, limitNum, offset]);

  return {
    data: rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    }
  };
};

const getPartyOrderById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      po.id,
      po.party_id,
      po.type,
      po.date,
      po.status,
      po.case_number,
      po.details,
      po.created_at,
      po.created_by,
      p.name AS party_name,
      p.phone AS party_phone,
      p.category AS party_category,
      p.party_type,
      e.name AS created_by_name
    FROM parties_orders po
    LEFT JOIN parties p ON po.party_id = p.id
    LEFT JOIN employees e ON po.created_by = e.id
    WHERE po.id = ?
  `, [id]);
  return rows[0];
};

const getOrdersByPartyId = async (partyId) => {
  const [rows] = await db.query(`
    SELECT 
      po.id,
      po.type,
      po.date,
      po.status,
      po.case_number,
      po.details,
      po.created_at,
      po.created_by,
      e.name AS created_by_name
    FROM parties_orders po
    LEFT JOIN employees e ON po.created_by = e.id
    WHERE po.party_id = ?
    ORDER BY po.created_at DESC
  `, [partyId]);
  return rows;
};

const createPartyOrder = async (order) => {
  const { party_id, type, date, status, case_number, details, created_by } = order;
  
  // Ensure status is valid, default to 'pending'
  const orderStatus = status && [ 'approved', 'pending', 'rejected'].includes(status) ? status : 'pending';
  
  try {
    const [result] = await db.query(`
      INSERT INTO parties_orders (party_id, type, date, status, case_number, details, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [party_id, type, date, orderStatus, case_number, details, created_by]);
    return result.insertId;
  } catch (error) {
    console.error("Error inserting party order:", error);
    throw error;
  }
};

const updatePartyOrder = async (id, order) => {
  const { party_id, type, date, status, case_number, details } = order;
  
  // Build dynamic update query based on provided fields
  const updates = [];
  const params = [];
  
  if (party_id !== undefined) {
    updates.push('party_id = ?');
    params.push(party_id);
  }
  if (type !== undefined) {
    updates.push('type = ?');
    params.push(type);
  }
  if (date !== undefined) {
    updates.push('date = ?');
    params.push(date);
  }
  if (status !== undefined) {
    // Validate status
    const validStatus = [ 'approved', 'pending', 'rejected'].includes(status) ? status : 'pending';
    updates.push('status = ?');
    params.push(validStatus);
  }
  if (case_number !== undefined) {
    updates.push('case_number = ?');
    params.push(case_number);
  }
  if (details !== undefined) {
    updates.push('details = ?');
    params.push(details);
  }
  
  // If no fields to update, return false
  if (updates.length === 0) {
    return false;
  }
  
  params.push(id); // Add id at the end for WHERE clause
  
  const query = `UPDATE parties_orders SET ${updates.join(', ')} WHERE id = ?`;
  const [result] = await db.query(query, params);
  return result.affectedRows > 0;
};

const deletePartyOrder = async (id) => {
  const [result] = await db.query("DELETE FROM parties_orders WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

module.exports = {
  getAllPartiesOrders,
  getPartyOrderById,
  getOrdersByPartyId,
  createPartyOrder,
  updatePartyOrder,
  deletePartyOrder
};
