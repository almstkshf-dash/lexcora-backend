const db = require("../config/db");

const addClientRequest = async (clientRequestData, createdBy = null) => {
  try {
    const {
      request_title,
      client_id,
      request_date,
      response = null,
      type = null,
      details = null,
      status = 'pending'
    } = clientRequestData;

    const [result] = await db.query(
      `INSERT INTO client_requests 
       (request_title, client_id, request_date, response, type, details, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [request_title, client_id, request_date, response, type, details, status, createdBy]
    );

    return { id: result.insertId, ...clientRequestData };
  } catch (error) {
    console.error("Error adding client request:", error);
    throw error;
  }
};

const getAllClientRequests = async () => {
  try {
    const [rows] = await db.query(`
      SELECT cr.*, 
             c.name as client_name,
             e.name as employee_name,
             e.id as employee_id
      FROM client_requests cr
      LEFT JOIN parties c ON cr.client_id = c.id
      LEFT JOIN employees e ON cr.created_by = e.id
      ORDER BY cr.request_date DESC
    `);
    return rows;
  } catch (error) {
    console.error("Error fetching all client requests:", error);
    throw error;
  }
};

const getClientRequestById = async (id) => {
  try {
    const [rows] = await db.query(`
      SELECT cr.*, 
             c.name as client_name,
             e.name as employee_name,
             e.id as employee_id
      FROM client_requests cr
      LEFT JOIN parties c ON cr.client_id = c.id
      LEFT JOIN employees e ON cr.created_by = e.id
      WHERE cr.id = ?
    `, [id]);
    return rows[0];
  } catch (error) {
    console.error("Error fetching client request by ID:", error);
    throw error;
  }
};

const getClientRequestsByClientId = async (client_id) => {
  try {
    const [rows] = await db.query(`
      SELECT cr.*, 
             c.name as client_name,
             e.name as employee_name,
             e.id as employee_id
      FROM client_requests cr
      LEFT JOIN parties c ON cr.client_id = c.id
      LEFT JOIN employees e ON cr.created_by = e.id
      WHERE cr.client_id = ?
      ORDER BY cr.request_date DESC
    `, [client_id]);
    return rows;
  } catch (error) {
    console.error("Error fetching client requests by client ID:", error);
    throw error;
  }
};

const updateClientRequest = async (id, clientRequestData) => {
  try {
    const {
      request_title,
      client_id,
      request_date,
      response = null,
      type,
      details,
      status
    } = clientRequestData;

    // Build dynamic update query
    const updates = [];
    const values = [];

    if (request_title !== undefined) {
      updates.push('request_title = ?');
      values.push(request_title);
    }
    if (client_id !== undefined) {
      updates.push('client_id = ?');
      values.push(client_id);
    }
    if (request_date !== undefined) {
      updates.push('request_date = ?');
      values.push(request_date);
    }
    if (response !== undefined) {
      updates.push('response = ?');
      values.push(response);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      values.push(type);
    }
    if (details !== undefined) {
      updates.push('details = ?');
      values.push(details);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }

    if (updates.length === 0) {
      return true; // No updates needed
    }

    values.push(id);

    const [result] = await db.query(
      `UPDATE client_requests SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error updating client request:", error);
    throw error;
  }
};

const deleteClientRequest = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM client_requests WHERE id = ?", [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error("Error deleting client request:", error);
    throw error;
  }
};

module.exports = {
  addClientRequest,
  getAllClientRequests,
  getClientRequestById,
  getClientRequestsByClientId,
  updateClientRequest,
  deleteClientRequest,
};