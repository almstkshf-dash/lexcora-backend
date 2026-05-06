const db = require("../config/db");

// Get all assets with branch name and creator name
const getAllAssets = async (branch_id = null) => {
  try {
    let query = `
      SELECT 
        a.*,
        b.name_ar as branch_name,
        e.name as created_by_name,
        cust.name as custodian_name,
        acc.name_ar as account_name_ar,
        acc.name_en as account_name_en,
        acc.code as account_code,
        ab.amount as budget_amount,
        ab.fiscal_year as budget_fiscal_year,
        ab.fiscal_month as budget_fiscal_month
      FROM assets a
      LEFT JOIN branches b ON a.branch_id = b.id
      LEFT JOIN employees e ON a.created_by = e.id
      LEFT JOIN employees cust ON a.custodian_id = cust.id
      LEFT JOIN accounts acc ON a.account_id = acc.id
      LEFT JOIN account_budgets ab ON a.budget_id = ab.id
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
        e.name as created_by_name,
        cust.name as custodian_name,
        acc.name_ar as account_name_ar,
        acc.name_en as account_name_en,
        acc.code as account_code,
        ab.amount as budget_amount,
        ab.fiscal_year as budget_fiscal_year,
        ab.fiscal_month as budget_fiscal_month
      FROM assets a
      LEFT JOIN branches b ON a.branch_id = b.id
      LEFT JOIN employees e ON a.created_by = e.id
      LEFT JOIN employees cust ON a.custodian_id = cust.id
      LEFT JOIN accounts acc ON a.account_id = acc.id
      LEFT JOIN account_budgets ab ON a.budget_id = ab.id
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
    const { 
      name, type, branch_id, issue_date, expiry_date, note, created_by, record_type,
      category, serial_number, physical_location, custodian_id, budget_id,
      purchase_cost, purchase_date, account_id, depreciation_rate, salvage_value, current_value,
      depreciation_method, useful_life, status
    } = assetData;
    
    const query = `
      INSERT INTO assets (
        name, type, branch_id, issue_date, expiry_date, note, created_by, record_type,
        category, serial_number, physical_location, custodian_id, budget_id,
        purchase_cost, purchase_date, account_id, depreciation_rate, salvage_value, current_value,
        depreciation_method, useful_life, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.query(query, [
      name,
      type,
      branch_id,
      issue_date,
      expiry_date,
      note,
      created_by,
      record_type || 'resource',
      category || null,
      serial_number || null,
      physical_location || null,
      custodian_id || null,
      budget_id || null,
      purchase_cost ?? 0,
      purchase_date || null,
      account_id || null,
      depreciation_rate ?? 0,
      salvage_value ?? 0,
      current_value !== undefined && current_value !== null ? current_value : purchase_cost ?? 0,
      depreciation_method || 'straight_line',
      useful_life || 5,
      'active'
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
const updateAsset = async (id, assetData, connection = null) => {
  const queryRunner = connection || db;
  try {
    const { 
      name, type, branch_id, issue_date, expiry_date, note,
      category, serial_number, physical_location, custodian_id, budget_id,
      purchase_cost, purchase_date, account_id, depreciation_rate, salvage_value, current_value,
      depreciation_method, useful_life, status, disposal_date, disposal_value, disposal_reason,
      last_revaluation_date, last_revaluation_reason
    } = assetData;
    
    const query = `
      UPDATE assets
      SET name = ?, type = ?, branch_id = ?, issue_date = ?, expiry_date = ?, note = ?,
          category = ?, serial_number = ?, physical_location = ?, custodian_id = ?, budget_id = ?,
          purchase_cost = ?, purchase_date = ?, account_id = ?, depreciation_rate = ?, salvage_value = ?, current_value = ?,
          depreciation_method = ?, useful_life = ?, status = ?, disposal_date = ?, disposal_value = ?, disposal_reason = ?,
          last_revaluation_date = ?, last_revaluation_reason = ?
      WHERE id = ?
    `;
    
    const [result] = await queryRunner.query(query, [
      name,
      type,
      branch_id,
      issue_date,
      expiry_date,
      note,
      category || null,
      serial_number || null,
      physical_location || null,
      custodian_id || null,
      budget_id || null,
      purchase_cost || 0,
      purchase_date || null,
      account_id || null,
      depreciation_rate ?? 0,
      salvage_value ?? 0,
      current_value !== undefined && current_value !== null ? current_value : 0,
      depreciation_method || 'straight_line',
      useful_life || 5,
      status || 'active',
      disposal_date || null,
      disposal_value ?? 0,
      disposal_reason || null,
      last_revaluation_date || null,
      last_revaluation_reason || null,
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

const createAssetTransfer = async (transferData, connection = null) => {
  const queryRunner = connection || db;
  try {
    const {
      asset_id,
      from_branch_id,
      to_branch_id,
      from_custodian_id,
      to_custodian_id,
      transfer_date,
      reason,
      note,
      created_by
    } = transferData;

    const query = `
      INSERT INTO asset_transfers (
        asset_id, from_branch_id, to_branch_id, from_custodian_id, to_custodian_id,
        transfer_date, reason, note, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await queryRunner.query(query, [
      asset_id,
      from_branch_id || null,
      to_branch_id || null,
      from_custodian_id || null,
      to_custodian_id || null,
      transfer_date || new Date().toISOString().split('T')[0],
      reason || null,
      note || null,
      created_by || null
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

const getAssetTransfers = async (asset_id) => {
  try {
    const query = `
      SELECT at.*, b_from.name_ar AS from_branch_name_ar, b_from.name_en AS from_branch_name_en,
             b_to.name_ar AS to_branch_name_ar, b_to.name_en AS to_branch_name_en,
             e_from.name AS from_custodian_name,
             e_to.name AS to_custodian_name
      FROM asset_transfers at
      LEFT JOIN branches b_from ON at.from_branch_id = b_from.id
      LEFT JOIN branches b_to ON at.to_branch_id = b_to.id
      LEFT JOIN employees e_from ON at.from_custodian_id = e_from.id
      LEFT JOIN employees e_to ON at.to_custodian_id = e_to.id
      WHERE at.asset_id = ?
      ORDER BY at.transfer_date DESC, at.created_at DESC
    `;

    const [rows] = await db.query(query, [asset_id]);
    return rows;
  } catch (error) {
    throw error;
  }
};

const createAssetRevaluation = async (revaluationData, connection = null) => {
  const queryRunner = connection || db;
  try {
    const {
      asset_id,
      previous_value,
      new_value,
      change_amount,
      revaluation_date,
      reason,
      note,
      created_by
    } = revaluationData;

    const query = `
      INSERT INTO asset_revaluations (
        asset_id, previous_value, new_value, change_amount, revaluation_date, reason, note, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await queryRunner.query(query, [
      asset_id,
      previous_value,
      new_value,
      change_amount,
      revaluation_date || new Date().toISOString().split('T')[0],
      reason || null,
      note || null,
      created_by || null
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

const getAssetRevaluations = async (asset_id) => {
  try {
    const query = `
      SELECT ar.*
      FROM asset_revaluations ar
      WHERE ar.asset_id = ?
      ORDER BY ar.revaluation_date DESC, ar.created_at DESC
    `;

    const [rows] = await db.query(query, [asset_id]);
    return rows;
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
  deleteAssetDocument,
  createAssetTransfer,
  getAssetTransfers,
  createAssetRevaluation,
  getAssetRevaluations
};
