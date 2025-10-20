const db = require("../config/db");

const getAllPartiesDocuments = async () => {
  const [rows] = await db.query(`
    SELECT 
      pd.*, 
      p.name as partyName,
      p.phone as partyPhone,
      p.email as partyEmail
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
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
      p.email as partyEmail
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
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
      p.email as partyEmail
    FROM parties_documents pd
    LEFT JOIN parties p ON pd.party_id = p.id
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
    description,
    file_size,
    file_type
  } = document;

  const [result] = await db.query(
    `INSERT INTO parties_documents (party_id, file_name, url, description, file_size, file_type, created_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [party_id, file_name, url, description, file_size, file_type]
  );

  return result.insertId;
};

const updatePartiesDocument = async (id, document) => {
  const {
    party_id,
    file_name,
    url,
    description,
    file_size,
    file_type
  } = document;

  let query = `UPDATE parties_documents SET `;
  const params = [];
  const updates = [];

  if (party_id !== undefined) {
    updates.push(`party_id = ?`);
    params.push(party_id);
  }
  if (file_name !== undefined) {
    updates.push(`file_name = ?`);
    params.push(file_name);
  }
  if (url !== undefined) {
    updates.push(`url = ?`);
    params.push(url);
  }
  if (description !== undefined) {
    updates.push(`description = ?`);
    params.push(description);
  }
  if (file_size !== undefined) {
    updates.push(`file_size = ?`);
    params.push(file_size);
  }
  if (file_type !== undefined) {
    updates.push(`file_type = ?`);
    params.push(file_type);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  updates.push(`updated_at = NOW()`);
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
    WHERE pd.file_name LIKE ? OR pd.description LIKE ? OR p.name LIKE ?
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