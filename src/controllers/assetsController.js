const assetsModel = require("../models/assetsModel");
const accountingService = require("../services/accountingService");
const depreciationService = require("../services/depreciationService");
const { deleteDocumentFiles } = require("../services/storageService");
const {
  DEPRECIATION_METHODS,
  DEPRECIATION_METHOD_LABELS
} = require("../utils/depreciationCalculator");
const db = require("../config/db");

// Get all assets with branch info and documents count
const getAssets = async (req, res) => {
  try {
    const { branch_id } = req.query;
    const assets = await assetsModel.getAllAssets(branch_id || null);
    
    // Get documents count for each asset
    const assetsWithDocs = await Promise.all(
      assets.map(async (asset) => {
        const documents = await assetsModel.getAssetDocuments(asset.id);
        return {
          ...asset,
          documents_count: documents.length
        };
      })
    );
    
    res.json({
      success: true,
      data: assetsWithDocs,
      count: assetsWithDocs.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get asset by ID with documents and created by info
const getAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await assetsModel.getAssetById(id);
    
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }
    
    // Get documents
    const documents = await assetsModel.getAssetDocuments(id);
    
    res.json({
      success: true,
      data: {
        ...asset,
        documents
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get asset documents
const getAssetDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await assetsModel.getAssetDocuments(id);
    
    res.json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const validateDepreciationInput = ({ depreciation_method, depreciation_rate, useful_life, purchase_cost, salvage_value }) => {
  if (depreciation_method && !Object.values(DEPRECIATION_METHODS).includes(depreciation_method)) {
    return 'Invalid depreciation method. Must be one of: ' + Object.values(DEPRECIATION_METHODS).join(', ');
  }

  const cost = parseFloat(purchase_cost) || 0;
  const salvage = salvage_value !== undefined ? parseFloat(salvage_value) : 0;

  if (depreciation_method === DEPRECIATION_METHODS.DECLINING_BALANCE) {
    if (!useful_life || parseInt(useful_life, 10) <= 0) {
      return 'Useful life must be provided and greater than 0 for declining balance depreciation';
    }
  }

  if (depreciation_method === DEPRECIATION_METHODS.STRAIGHT_LINE) {
    if ((!depreciation_rate || parseFloat(depreciation_rate) <= 0) && (!useful_life || parseInt(useful_life, 10) <= 0)) {
      return 'Straight line depreciation requires an annual rate or a useful life value';
    }
  }

  if (salvage_value !== undefined && cost > 0 && salvage >= cost) {
    return 'Salvage value must be less than the purchase cost';
  }

  return null;
};

// Create new asset with documents
const createAsset = async (req, res) => {
  try {
    const { 
      name, type, branch_id, issue_date, expiry_date, note, documents, record_type,
      purchase_cost, acquisition_cost, purchase_date, account_id, depreciation_rate, salvage_value, current_value,
      category, serial_number, physical_location, custodian_id, budget_id, depreciation_method, useful_life
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !branch_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, type, branch_id"
      });
    }
    
    const effectiveCost = purchase_cost ?? acquisition_cost ?? 0;
    if ((effectiveCost > 0 || depreciation_rate > 0) && !account_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: account_id when asset has cost or depreciation"
      });
    }

    const depreciationValidationMessage = validateDepreciationInput({
      depreciation_method,
      depreciation_rate,
      useful_life,
      purchase_cost: effectiveCost,
      salvage_value
    });

    if (depreciationValidationMessage) {
      return res.status(400).json({ success: false, message: depreciationValidationMessage });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || null;
    
    // Create asset
    const assetData = {
      name,
      type,
      branch_id,
      issue_date: issue_date || null,
      expiry_date: expiry_date || null,
      note: note || null,
      created_by,
      record_type: record_type || 'resource', // Default to 'resource' if not provided
      purchase_cost: effectiveCost,
      purchase_date,
      account_id,
      depreciation_rate,
      salvage_value,
      current_value,
      depreciation_method: depreciation_method || DEPRECIATION_METHODS.STRAIGHT_LINE,
      useful_life: useful_life || 5,
      category: category || null,
      serial_number: serial_number || null,
      physical_location: physical_location || null,
      custodian_id: custodian_id || null,
      budget_id: budget_id || null
    };
    
    const result = await assetsModel.createAsset(assetData);
    const assetId = result.insertId;
    
    // Add documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      const documentsData = documents.map(doc => ({
        asset_id: assetId,
        document_name: doc.document_name,
        document_url: doc.document_url,
        created_by
      }));
      
      await assetsModel.addAssetDocuments(documentsData);
    }
    
    // Automation: Post Journal Entry for Asset Purchase
    if (effectiveCost > 0) {
      try {
        await accountingService.postAutomatedEntry('ASSET_PURCHASE', {
          amount: effectiveCost,
          description: `Purchase of asset: ${name}`,
          name: name,
          debit_account_id: account_id, // Use the asset's specific account
          branch_id: branch_id,
          created_by: created_by
        });
      } catch (accErr) {
        console.error("Failed to post automated entry for asset purchase:", accErr);
        // We don't fail the whole request if accounting fails, but we log it
      }
    }
    
    
    // Get the created asset with details
    const createdAsset = await assetsModel.getAssetById(assetId);
    const assetDocuments = await assetsModel.getAssetDocuments(assetId);
    
    res.status(201).json({
      success: true,
      message: "Asset created successfully",
      data: {
        ...createdAsset,
        documents: assetDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update asset
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, type, branch_id, issue_date, expiry_date, note, documents,
      purchase_cost, acquisition_cost, purchase_date, account_id, depreciation_rate, salvage_value, current_value,
      category, serial_number, physical_location, custodian_id, budget_id, depreciation_method, useful_life
    } = req.body;
    
    // Check if asset exists
    const existingAsset = await assetsModel.getAssetById(id);
    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }
    
    // Validate required fields
    if (!name || !type || !branch_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, type, branch_id"
      });
    }
    
    const effectiveCost = purchase_cost ?? acquisition_cost ?? existingAsset.purchase_cost ?? 0;
    if ((effectiveCost > 0 || depreciation_rate > 0) && !account_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: account_id when asset has cost or depreciation"
      });
    }

    const depreciationValidationMessage = validateDepreciationInput({
      depreciation_method,
      depreciation_rate,
      useful_life,
      purchase_cost: effectiveCost,
      salvage_value
    });

    if (depreciationValidationMessage) {
      return res.status(400).json({ success: false, message: depreciationValidationMessage });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user?.id || null;
    
    // Update asset
    const assetData = {
      name,
      type,
      branch_id,
      issue_date: issue_date || null,
      expiry_date: expiry_date || null,
      note: note || null,
      purchase_cost: effectiveCost,
      purchase_date,
      account_id,
      depreciation_rate,
      salvage_value,
      current_value,
      depreciation_method: depreciation_method || existingAsset.depreciation_method || DEPRECIATION_METHODS.STRAIGHT_LINE,
      useful_life: useful_life || existingAsset.useful_life || 5,
      category: category || null,
      serial_number: serial_number || null,
      physical_location: physical_location || null,
      custodian_id: custodian_id || null,
      budget_id: budget_id || null
    };
    
    await assetsModel.updateAsset(id, assetData);
    
    // Add new documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      const documentsData = documents.map(doc => ({
        asset_id: id,
        document_name: doc.document_name,
        document_url: doc.document_url,
        created_by
      }));
      
      await assetsModel.addAssetDocuments(documentsData);
    }
    
    // Get the updated asset with details
    const updatedAsset = await assetsModel.getAssetById(id);
    const assetDocuments = await assetsModel.getAssetDocuments(id);
    
    res.json({
      success: true,
      message: "Asset updated successfully",
      data: {
        ...updatedAsset,
        documents: assetDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete asset and all its documents (from DB and Vercel Blob)
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const asset = await assetsModel.getAssetById(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }
    
    // Get all documents BEFORE deleting
    const documents = await assetsModel.getAssetDocuments(id);
    
    // Delete asset from database (CASCADE will delete document records)
    await assetsModel.deleteAsset(id);
    
    // Delete files from Vercel Blob
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    res.json({
      success: true,
      message: "Asset and all associated files deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting asset:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete single asset document (from DB and Vercel Blob)
const deleteAssetDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    // Get all documents for this asset
    const documents = await assetsModel.getAssetDocuments(id);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    if (!documentToDelete) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }
    
    // Delete document from database
    await assetsModel.deleteAssetDocument(documentId, id);
    
    // Delete file from Vercel Blob
    if (documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (err) {
    console.error("Error deleting asset document:", err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

const getPostingSetting = async (event, connection = null) => {
  const [rows] = await (connection || db).query(
    "SELECT debit_account_id, credit_account_id FROM posting_settings WHERE event_key = ? AND is_active = TRUE",
    [event]
  );
  return rows[0];
};

// Dispose asset (Financial disposal)
const disposeAsset = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { disposal_date, disposal_value, reason, note } = req.body;
    
    const asset = await assetsModel.getAssetById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    const disposalAmount = disposal_value !== undefined && disposal_value !== null
      ? parseFloat(disposal_value)
      : parseFloat(asset.current_value || 0);

    await assetsModel.updateAsset(id, {
      ...asset,
      current_value: 0,
      status: 'disposed',
      disposal_date: disposal_date || new Date().toISOString().split('T')[0],
      disposal_value: disposalAmount,
      disposal_reason: reason || null,
      note: `${asset.note || ''}\n[DISPOSED ${disposal_date || new Date().toISOString().split('T')[0]}] Reason: ${reason || 'N/A'}${note ? `; ${note}` : ''}`
    }, connection);

    if (disposalAmount > 0) {
      await accountingService.postAutomatedEntry('ASSET_DISPOSAL', {
        amount: disposalAmount,
        description: `Disposal of asset: ${asset.name}. Reason: ${reason || 'N/A'}`,
        name: asset.name,
        credit_account_id: asset.account_id,
        branch_id: asset.branch_id,
        created_by: req.user?.id
      }, connection);
    }

    await connection.commit();
    res.json({ success: true, message: "Asset disposed successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

const transferAsset = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { to_branch_id, to_custodian_id, transfer_date, reason, note } = req.body;

    const asset = await assetsModel.getAssetById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    if (!to_branch_id && !to_custodian_id) {
      return res.status(400).json({ success: false, message: "At least one of to_branch_id or to_custodian_id is required" });
    }

    if (to_branch_id === asset.branch_id && to_custodian_id === asset.custodian_id) {
      return res.status(400).json({ success: false, message: "Asset is already assigned to the requested branch/custodian" });
    }

    await assetsModel.createAssetTransfer({
      asset_id: id,
      from_branch_id: asset.branch_id,
      to_branch_id: to_branch_id || asset.branch_id,
      from_custodian_id: asset.custodian_id,
      to_custodian_id: to_custodian_id || asset.custodian_id,
      transfer_date: transfer_date || new Date().toISOString().split('T')[0],
      reason,
      note,
      created_by: req.user?.id
    }, connection);

    await assetsModel.updateAsset(id, {
      ...asset,
      branch_id: to_branch_id || asset.branch_id,
      custodian_id: to_custodian_id || asset.custodian_id,
      status: 'transferred',
      note: `${asset.note || ''}\n[TRANSFER ${transfer_date || new Date().toISOString().split('T')[0]}] To branch: ${to_branch_id || asset.branch_id}, To custodian: ${to_custodian_id || asset.custodian_id}${reason ? `. Reason: ${reason}` : ''}${note ? `; ${note}` : ''}`
    }, connection);

    await connection.commit();
    res.json({ success: true, message: "Asset transfer recorded successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

const getAssetTransfers = async (req, res) => {
  try {
    const { id } = req.params;
    const transfers = await assetsModel.getAssetTransfers(id);

    res.json({
      success: true,
      data: transfers,
      count: transfers.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const revalueAsset = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const { revaluation_date, new_value, reason, note } = req.body;

    const asset = await assetsModel.getAssetById(id);
    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found" });
    }

    const currentValue = parseFloat(asset.current_value || 0);
    const targetValue = parseFloat(new_value);

    if (Number.isNaN(targetValue) || targetValue <= 0) {
      return res.status(400).json({ success: false, message: "new_value is required and must be greater than 0" });
    }

    const changeAmount = targetValue - currentValue;
    if (changeAmount === 0) {
      return res.status(400).json({ success: false, message: "Revaluation amount must differ from current asset value" });
    }

    const effectiveDate = revaluation_date || new Date().toISOString().split('T')[0];
    const setting = await getPostingSetting('ASSET_REVALUATION', connection);
    if (!setting) {
      throw new Error('Posting settings not found for asset revaluation');
    }

    let debitAccountId = setting.debit_account_id;
    let creditAccountId = setting.credit_account_id;

    if (changeAmount < 0) {
      debitAccountId = setting.credit_account_id;
      creditAccountId = setting.debit_account_id;
    }

    await assetsModel.createAssetRevaluation({
      asset_id: id,
      previous_value: currentValue,
      new_value: targetValue,
      change_amount: changeAmount,
      revaluation_date: effectiveDate,
      reason,
      note,
      created_by: req.user?.id
    }, connection);

    await assetsModel.updateAsset(id, {
      ...asset,
      current_value: targetValue,
      status: 'revalued',
      last_revaluation_date: effectiveDate,
      last_revaluation_reason: reason || null,
      note: `${asset.note || ''}\n[REVALUATION ${effectiveDate}] Previous: ${currentValue}, New: ${targetValue}${reason ? `. Reason: ${reason}` : ''}${note ? `; ${note}` : ''}`
    }, connection);

    await accountingService.postAutomatedEntry('ASSET_REVALUATION', {
      amount: Math.abs(changeAmount),
      description: `Revaluation of asset: ${asset.name}. ${reason || 'No reason provided'}`,
      name: asset.name,
      debit_account_id: debitAccountId,
      credit_account_id: creditAccountId,
      branch_id: asset.branch_id,
      created_by: req.user?.id
    }, connection);

    await connection.commit();
    res.json({ success: true, message: 'Asset revalued successfully' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

const getAssetRevaluations = async (req, res) => {
  try {
    const { id } = req.params;
    const revaluations = await assetsModel.getAssetRevaluations(id);

    res.json({
      success: true,
      data: revaluations,
      count: revaluations.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get depreciation schedule for an asset
const getDepreciationSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { months = 12 } = req.query;

    const schedule = await depreciationService.getAssetDepreciationSchedule(id, parseInt(months));

    res.json({
      success: true,
      data: schedule,
      asset_id: id,
      total_periods: schedule.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get current month depreciation calculation
const getCurrentMonthDepreciation = async (req, res) => {
  try {
    const { id } = req.params;

    const calculation = await depreciationService.calculateCurrentMonthDepreciation(id);

    res.json({
      success: true,
      data: calculation
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update asset depreciation settings
const updateDepreciationSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      depreciation_method, 
      depreciation_rate, 
      useful_life, 
      salvage_value
    } = req.body;

    const asset = await assetsModel.getAssetById(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found"
      });
    }

    const validationMessage = validateDepreciationInput({
      depreciation_method: depreciation_method || asset.depreciation_method,
      depreciation_rate,
      useful_life,
      purchase_cost: asset.purchase_cost,
      salvage_value
    });

    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    // Update depreciation settings
    const updatedAsset = await depreciationService.updateAssetDepreciationSettings(id, {
      purchase_cost: asset.purchase_cost,
      depreciation_method: depreciation_method || asset.depreciation_method,
      depreciation_rate,
      useful_life,
      salvage_value
    });

    res.json({
      success: true,
      message: "Depreciation settings updated successfully",
      data: updatedAsset
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Calculate depreciation preview
const getDepreciationMethods = async (req, res) => {
  try {
    res.json({
      success: true,
      data: Object.entries(DEPRECIATION_METHOD_LABELS).map(([value, label]) => ({
        value,
        label
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDepreciationPreview = async (req, res) => {
  try {
    const {
      purchase_cost,
      salvage_value,
      depreciation_rate,
      useful_life,
      depreciation_method,
      purchase_date
    } = req.body;

    if (!purchase_cost || purchase_cost <= 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase cost is required and must be greater than 0"
      });
    }

    const method = depreciation_method || DEPRECIATION_METHODS.STRAIGHT_LINE;

    const validationMessage = validateDepreciationInput({
      depreciation_method: method,
      depreciation_rate,
      useful_life,
      purchase_cost,
      salvage_value
    });

    if (validationMessage) {
      return res.status(400).json({ success: false, message: validationMessage });
    }

    const { getDepreciationSchedule } = require("../utils/depreciationCalculator");

    const schedule = getDepreciationSchedule({
      purchaseCost: purchase_cost,
      salvageValue: salvage_value || 0,
      usefulLife: useful_life || 5,
      annualRate: depreciation_rate || 10,
      method,
      purchaseDate: purchase_date || new Date(),
      periods: 12,
      periodType: 'month'
    });

    res.json({
      success: true,
      data: {
        method,
        method_label: DEPRECIATION_METHOD_LABELS[method] || null,
        schedule,
        summary: {
          purchase_cost,
          salvage_value: salvage_value || 0,
          total_depreciation: schedule[schedule.length - 1].totalDepreciation,
          monthly_avg: schedule[schedule.length - 1].totalDepreciation / schedule.length
        }
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getAssets,
  getAsset,
  getAssetDocuments,
  createAsset,
  updateAsset,
  deleteAsset,
  deleteAssetDocument,
  disposeAsset,
  transferAsset,
  getAssetTransfers,
  revalueAsset,
  getAssetRevaluations,
  getDepreciationSchedule,
  getCurrentMonthDepreciation,
  updateDepreciationSettings,
  getDepreciationPreview,
  getDepreciationMethods
};
