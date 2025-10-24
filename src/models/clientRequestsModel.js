const db = require("../config/db");

const addClientRequest = async (clientRequestData) => {
  try {
    const {
      request_title,
      client_id,
      request_date,
      response = null
    } = clientRequestData;

    const [result] = await db.query(
      `INSERT INTO client_requests 
       (request_title, client_id, request_date, response) 
       VALUES (?, ?, ?, ?)`,
      [request_title, client_id, request_date, response]
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
      SELECT cr.*, c.name as client_name
      FROM client_requests cr
      LEFT JOIN parties c ON cr.client_id = c.id
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
      SELECT cr.*, c.name as client_name
      FROM client_requests cr
      LEFT JOIN parties c ON cr.client_id = c.id
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
      SELECT cr.*, c.name as client_name
      FROM client_requests cr
      LEFT JOIN parties c ON cr.client_id = c.id
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
      response = null
    } = clientRequestData;

    const [result] = await db.query(
      `UPDATE client_requests SET 
       request_title = ?, client_id = ?, request_date = ?, response = ?
       WHERE id = ?`,
      [request_title, client_id, request_date, response, id]
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