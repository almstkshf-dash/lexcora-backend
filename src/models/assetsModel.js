const db = require("../config/db");

// Get all assets with branch name and creator name
const getAllAssets = async (branch_id = null) => {
  try {
    let query = `
      SELECT 
        a.*,
        b.name_ar as branch_name,
        e.name as created_by_name
      FROM assets a
      LEFT JOIN branches b ON a.branch_id = b.id
      LEFT JOIN employees e ON a.created_by = e.id
    `;
    
    const params = [];
    if (branch_id) {
      query += ' WHERE a.branch_id = ?';
      params.push(branch_id);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Get asset by ID with branch and creator info
const getAssetById = async (id) => {
  try {
    const query = `
      SELECT 
        a.*,
        b.name_ar as branch_name,
        e.name as created_by_name
      FROM assets a
      LEFT JOIN branches b ON a.branch_id = b.id
      LEFT JOIN employees e ON a.created_by = e.id
      WHERE a.id = ?
    `;
    
    const [rows] = await db.query(query, [id]);
    return rows[0];
  } catch (error) {
    throw error;
  }
};

// Get all documents for an asset
const getAssetDocuments = async (asset_id) => {
  try {
    const query = `
      SELECT 
        ad.*,
        e.name as created_by_name
      FROM asset_documents ad
      LEFT JOIN employees e ON ad.created_by = e.id
      WHERE ad.asset_id = ?
      ORDER BY ad.created_at DESC
    `;
    
    const [rows] = await db.query(query, [asset_id]);
    return rows;
  } catch (error) {
    throw error;
  }
};

// Create new asset
const createAsset = async (assetData) => {
  try {
    const { name, type, branch_id, issue_date, expiry_date, note, created_by, record_type } = assetData;
    
    const query = `
      INSERT INTO assets (name, type, branch_id, issue_date, expiry_date, note, created_by, record_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      name,
      type,
      branch_id,
      issue_date,
      expiry_date,
      note,
      created_by,
      record_type || 'resource' // Default to 'resource' if not provided
    ]);
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Add documents to an asset
const addAssetDocuments = async (documentsArray) => {
  try {
    if (!documentsArray || documentsArray.length === 0) {
      return { affectedRows: 0 };
    }
    
    const query = `
      INSERT INTO asset_documents (asset_id, document_name, document_url, created_by)
      VALUES ?
    `;
    
    const values = documentsArray.map(doc => [
      doc.asset_id,
      doc.document_name,
      doc.document_url,
      doc.created_by
    ]);
    
    const [result] = await db.query(query, [values]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Update asset
const updateAsset = async (id, assetData) => {
  try {
    const { name, type, branch_id, issue_date, expiry_date, note } = assetData;
    
    const query = `
      UPDATE assets
      SET name = ?, type = ?, branch_id = ?, issue_date = ?, expiry_date = ?, note = ?
      WHERE id = ?
    `;
    
    const [result] = await db.query(query, [
      name,
      type,
      branch_id,
      issue_date,
      expiry_date,
      note,
      id
    ]);
    
    return result;
  } catch (error) {
    throw error;
  }
};

// Delete asset
const deleteAsset = async (id) => {
  try {
    const query = 'DELETE FROM assets WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
  } catch (error) {
    throw error;
  }
};

// Delete single asset document
const deleteAssetDocument = async (documentId, assetId) => {
  try {
    const query = 'DELETE FROM asset_documents WHERE id = ? AND asset_id = ?';
    const [result] = await db.query(query, [documentId, assetId]);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllAssets,
  getAssetById,
  getAssetDocuments,
  createAsset,
  addAssetDocuments,
  updateAsset,
  deleteAsset,
  deleteAssetDocument
};
