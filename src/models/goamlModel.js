const db = require('../config/db');

/**
 * Get all GoAML records
 */
const getAllGoamlRecords = async () => {
  const [records] = await db.query(`
    SELECT 
      g.*,
      e.name as created_by_name
    FROM goaml g
    LEFT JOIN employees e ON g.created_by = e.id
    ORDER BY g.created_at DESC
  `);
  
  return records;
};

/**
 * Get GoAML record by ID
 */
const getGoamlRecordById = async (id) => {
  const [records] = await db.query(
    `SELECT 
      g.*,
      e.name as created_by_name
    FROM goaml g
    LEFT JOIN employees e ON g.created_by = e.id
    WHERE g.id = ?`,
    [id]
  );
  
  return records.length > 0 ? records[0] : null;
};

/**
 * Create new GoAML record
 */
const createGoamlRecord = async (recordData) => {
  const {
    name,
    phone,
    type,
    note,
    status,
    created_by
  } = recordData;
  
  const [result] = await db.query(
    `INSERT INTO goaml 
    (name, phone, type, note, status, created_by)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [name, phone, type, note, status, created_by]
  );
  
  return result.insertId;
};

/**
 * Update GoAML record
 */
const updateGoamlRecord = async (id, recordData) => {
  const {
    name,
    phone,
    note,
    type,
    status
  } = recordData;
  
  const [result] = await db.query(
    `UPDATE goaml 
    SET name = ?, phone = ?, type = ?, note = ?, status = ?
    WHERE id = ?`,
    [name, phone, type, note, status, id]
  );
  
  return result.affectedRows > 0;
};

/**
 * Delete GoAML record
 */
const deleteGoamlRecord = async (id) => {
  const [result] = await db.query(
    'DELETE FROM goaml WHERE id = ?',
    [id]
  );
  
  return result.affectedRows > 0;
};

module.exports = {
  getAllGoamlRecords,
  getGoamlRecordById,
  createGoamlRecord,
  updateGoamlRecord,
  deleteGoamlRecord
};
