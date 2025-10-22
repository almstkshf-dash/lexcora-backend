const db = require("../config/db");

const getAllPartiesDocuments = async () => {
  const [rows] = await db.query(`
    SELECT 
      pd.*, 
      p.name as partyName,
      p.phone as partyPhone,
      p.email as partyEmail,
      u.name as uploaded_by_name
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
    LEFT JOIN employees u ON pd.uploaded_by = u.id
    ORDER BY pd.created_at DESC
  `);
  
  return rows;
};

const getPartiesDocumentById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      pd.*, 
      p.name as partyName,
      p.phone as partyPhone,
      p.email as partyEmail,
      u.name as uploaded_by_name
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
    LEFT JOIN employees u ON pd.uploaded_by = u.id
    WHERE pd.id = ?
  `, [id]);
  
  return rows.length > 0 ? rows[0] : null;
};

const getPartiesDocumentsByPartyId = async (partyId) => {
  const [rows] = await db.query(`
    SELECT 
      pd.*, 
      p.name as partyName,
      p.phone as partyPhone,
      p.email as partyEmail,
      u.name as uploaded_by_name
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
    LEFT JOIN employees u ON pd.uploaded_by = u.id
    WHERE pd.party_id = ?
    ORDER BY pd.created_at DESC
  `, [partyId]);
  
  return rows;
};

const createPartiesDocument = async (document) => {
  const {
    party_id,
    file_name,
    url,
    uploaded_by
  } = document;

  const [result] = await db.query(
    `INSERT INTO parties_documents (party_id, document_name, document_url, uploaded_by) 
     VALUES (?, ?, ?, ?)`,
    [party_id, file_name, url, uploaded_by || null]
  );

  return result.insertId;
};

const updatePartiesDocument = async (id, document) => {
  const {
    party_id,
    file_name,
    url,
    uploaded_by
  } = document;

  let query = `UPDATE parties_documents SET `;
  const params = [];
  const updates = [];

  if (party_id !== undefined) {
    updates.push(`party_id = ?`);
    params.push(party_id);
  }
  if (file_name !== undefined) {
    updates.push(`document_name = ?`);
    params.push(file_name);
  }
  if (url !== undefined) {
    updates.push(`document_url = ?`);
    params.push(url);
  }
  if (uploaded_by !== undefined) {
    updates.push(`uploaded_by = ?`);
    params.push(uploaded_by);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  query += updates.join(", ") + ` WHERE id = ?`;
  params.push(id);

  const [result] = await db.query(query, params);
  return result.affectedRows > 0;
};

const deletePartiesDocument = async (id) => {
  const [result] = await db.query(
    `DELETE FROM parties_documents WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

const checkPartyExists = async (partyId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) as count FROM parties WHERE id = ?`,
    [partyId]
  );
  return rows[0].count > 0;
};

const getDocumentsByFileType = async (fileType) => {
  const [rows] = await db.query(`
    SELECT 
      pd.*, 
      p.name as partyName,
      p.phone as partyPhone,
      p.email as partyEmail
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
    WHERE pd.file_type = ?
    ORDER BY pd.created_at DESC
  `, [fileType]);
  
  return rows;
};

const searchDocuments = async (searchTerm) => {
  const [rows] = await db.query(`
    SELECT 
      pd.*, 
      p.name as partyName,
      p.phone as partyPhone,
      p.email as partyEmail
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
    WHERE pd.document_name LIKE ? OR pd.description LIKE ? OR p.name LIKE ?
    ORDER BY pd.created_at DESC
  `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
  
  return rows;
};

const getDocumentsStatistics = async () => {
  const [totalRows] = await db.query(`
    SELECT COUNT(*) as total_documents FROM parties_documents
  `);
  
  const [typeRows] = await db.query(`
    SELECT file_type, COUNT(*) as count 
    FROM parties_documents 
    WHERE file_type IS NOT NULL 
    GROUP BY file_type
  `);
  
  const [sizeRows] = await db.query(`
    SELECT SUM(file_size) as total_size 
    FROM parties_documents 
    WHERE file_size IS NOT NULL
  `);

  return {
    total_documents: totalRows[0].total_documents,
    by_type: typeRows,
    total_size: sizeRows[0].total_size || 0
  };
};

module.exports = {
  getAllPartiesDocuments,
  getPartiesDocumentById,
  getPartiesDocumentsByPartyId,
  createPartiesDocument,
  updatePartiesDocument,
  deletePartiesDocument,
  checkPartyExists,
  getDocumentsByFileType,
  searchDocuments,
  getDocumentsStatistics
};