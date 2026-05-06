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
    
    res.success(assetsWithDocs, req.t('generic.ok'), 200, {
      count: assetsWithDocs.length
    });
  } catch (err) {
    console.error('[GET_ASSETS_ERROR]', { message: err.message, stack: err.stack, query: req.query });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_ASSETS_FAILED');
  }
};

// Get asset by ID with documents and created by info
const getAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await assetsModel.getAssetById(id);
    
    if (!asset) {
      return res.fail(req.t('asset.notFound'), 404, 'NOT_FOUND');
    }
    
    // Get documents
    const documents = await assetsModel.getAssetDocuments(id);
    
    res.success({
      ...asset,
      documents
    });
  } catch (err) {
    console.error('[GET_ASSET_ERROR]', { message: err.message, stack: err.stack, params: req.params });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_ASSET_FAILED');
  }
};

// Get asset documents
const getAssetDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await assetsModel.getAssetDocuments(id);
    
    res.success(documents, req.t('generic.ok'), 200, {
      count: documents.length
    });
  } catch (err) {
    console.error('[GET_ASSET_DOCUMENTS_ERROR]', { message: err.message, stack: err.stack, params: req.params });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_ASSET_DOCS_FAILED');
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
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
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
        console.error("[POST_AUTOMATED_ENTRY_ERROR]", { message: accErr.message, stack: accErr.stack });
      }
    }
    
    // Get the created asset with details
    const createdAsset = await assetsModel.getAssetById(assetId);
    const assetDocuments = await assetsModel.getAssetDocuments(assetId);
    
    res.created({
      ...createdAsset,
      documents: assetDocuments
    }, req.t('asset.failedCreate'));
  } catch (err) {
    console.error('[CREATE_ASSET_ERROR]', { message: err.message, stack: err.stack, body: req.body });
    res.fail(req.t('asset.failedCreate'), 500, 'CREATE_ASSET_FAILED');
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
      return res.fail(req.t('asset.notFound'), 404, 'NOT_FOUND');
    }
    
    // Validate required fields
    if (!name || !type || !branch_id) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
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
    
    res.success({
      ...updatedAsset,
      documents: assetDocuments
    }, req.t('asset.failedUpdate'));
  } catch (err) {
    console.error('[UPDATE_ASSET_ERROR]', { message: err.message, stack: err.stack, params: req.params, body: req.body });
    res.fail(req.t('asset.failedUpdate'), 500, 'UPDATE_ASSET_FAILED');
  }
};

// Delete asset and all its documents (from DB and Vercel Blob)
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const asset = await assetsModel.getAssetById(id);
    if (!asset) {
      return res.fail(req.t('asset.notFound'), 404, 'NOT_FOUND');
    }
    
    // Get all documents BEFORE deleting
    const documents = await assetsModel.getAssetDocuments(id);
    
    // Delete asset from database (CASCADE will delete document records)
    await assetsModel.deleteAsset(id);
    
    // Delete files from Vercel Blob
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    res.success(null, req.t('asset.failedDelete'));
  } catch (err) {
    console.error('[DELETE_ASSET_ERROR]', { message: err.message, stack: err.stack, params: req.params });
    res.fail(req.t('asset.failedDelete'), 500, 'DELETE_ASSET_FAILED');
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
      return res.fail(req.t('generic.notFound'), 404, 'NOT_FOUND');
    }
    
    // Delete document from database
    await assetsModel.deleteAssetDocument(documentId, id);
    
    // Delete file from Vercel Blob
    if (documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    res.success(null, req.t('asset.docDeleted'));
  } catch (err) {
    console.error('[DELETE_ASSET_DOCUMENT_ERROR]', { message: err.message, stack: err.stack, params: req.params });
    res.fail(req.t('asset.failedDelete'), 500, 'DELETE_ASSET_DOC_FAILED');
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
      return res.fail(req.t('asset.notFound'), 404, 'NOT_FOUND');
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
    res.success(null, req.t('asset.disposed'));
  } catch (err) {
    await connection.rollback();
    console.error('[DISPOSE_ASSET_ERROR]', { message: err.message, stack: err.stack, params: req.params, body: req.body });
    res.fail(err.message, 500, 'DISPOSE_ASSET_FAILED');
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
      return res.fail(req.t('asset.notFound'), 404, 'NOT_FOUND');
    }

    if (!to_branch_id && !to_custodian_id) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }

    if (to_branch_id === asset.branch_id && to_custodian_id === asset.custodian_id) {
      return res.fail(req.t('generic.validationError'), 400, 'NO_CHANGE');
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
    console.error('[TRANSFER_ASSET_ERROR]', { message: err.message, stack: err.stack, params: req.params, body: req.body });
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
  }
};

const getAssetTransfers = async (req, res) => {
  try {
    const { id } = req.params;
    const transfers = await assetsModel.getAssetTransfers(id);

    res.success(transfers, req.t('generic.ok'), 200, {
      count: transfers.length
    });
  } catch (err) {
    console.error('[GET_ASSET_TRANSFERS_ERROR]', { message: err.message, stack: err.stack, params: req.params });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_TRANSFERS_FAILED');
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
      return res.fail(req.t('asset.notFound'), 404, 'NOT_FOUND');
    }

    const currentValue = parseFloat(asset.current_value || 0);
    const targetValue = parseFloat(new_value);

    if (Number.isNaN(targetValue) || targetValue <= 0) {
      return res.fail(req.t('generic.validationError'), 400, 'INVALID_VALUE');
    }

    const changeAmount = targetValue - currentValue;
    if (changeAmount === 0) {
      return res.fail(req.t('generic.validationError'), 400, 'NO_CHANGE');
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
    res.success(null, req.t('asset.revalued'));
  } catch (err) {
    await connection.rollback();
    console.error('[REVALUE_ASSET_ERROR]', { message: err.message, stack: err.stack, params: req.params, body: req.body });
    res.fail(req.t('asset.failedRevalue'), 500, 'REVALUE_ASSET_FAILED');
  } finally {
    connection.release();
  }
};

const getAssetRevaluations = async (req, res) => {
  try {
    const { id } = req.params;
    const revaluations = await assetsModel.getAssetRevaluations(id);

    res.success(revaluations, req.t('generic.ok'), 200, {
      count: revaluations.length
    });
  } catch (err) {
    console.error('[GET_ASSET_REVALUATIONS_ERROR]', { message: err.message, stack: err.stack, params: req.params });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_REVALUATIONS_FAILED');
  }
};

// Get depreciation schedule for an asset
const getDepreciationSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { months = 12 } = req.query;

    const schedule = await depreciationService.getAssetDepreciationSchedule(id, parseInt(months));

    res.success(schedule, req.t('generic.ok'), 200, {
      asset_id: id,
      total_periods: schedule.length
    });
  } catch (err) {
    console.error('[GET_DEPRECIATION_SCHEDULE_ERROR]', { message: err.message, stack: err.stack, params: req.params, query: req.query });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_SCHEDULE_FAILED');
  }
};

// Get current month depreciation calculation
const getCurrentMonthDepreciation = async (req, res) => {
  try {
    const { id } = req.params;

    const calculation = await depreciationService.calculateCurrentMonthDepreciation(id);

    res.success(calculation);
  } catch (err) {
    console.error('[GET_CURRENT_MONTH_DEPRECIATION_ERROR]', { message: err.message, stack: err.stack, params: req.params });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_MONTHLY_DEPRECIATION_FAILED');
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
      return res.fail(req.t('asset.notFound'), 404, 'NOT_FOUND');
    }

    const validationMessage = validateDepreciationInput({
      depreciation_method: depreciation_method || asset.depreciation_method,
      depreciation_rate,
      useful_life,
      purchase_cost: asset.purchase_cost,
      salvage_value
    });

    if (validationMessage) {
      return res.fail(validationMessage, 400, 'VALIDATION_ERROR');
    }

    // Update depreciation settings
    const updatedAsset = await depreciationService.updateAssetDepreciationSettings(id, {
      purchase_cost: asset.purchase_cost,
      depreciation_method: depreciation_method || asset.depreciation_method,
      depreciation_rate,
      useful_life,
      salvage_value
    });

    res.success(updatedAsset, req.t('asset.settingsUpdated'));
  } catch (err) {
    console.error('[UPDATE_DEPRECIATION_SETTINGS_ERROR]', { message: err.message, stack: err.stack, params: req.params, body: req.body });
    res.fail(req.t('asset.failedUpdate'), 500, 'UPDATE_SETTINGS_FAILED');
  }
};

// Calculate depreciation preview
const getDepreciationMethods = async (req, res) => {
  try {
    res.success(Object.entries(DEPRECIATION_METHOD_LABELS).map(([value, label]) => ({
      value,
      label
    })));
  } catch (err) {
    console.error('[GET_DEPRECIATION_METHODS_ERROR]', { message: err.message, stack: err.stack });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_METHODS_FAILED');
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
      return res.fail(req.t('generic.validationError'), 400, 'INVALID_COST');
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
      return res.fail(validationMessage, 400, 'VALIDATION_ERROR');
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

    res.success({
      method,
      method_label: DEPRECIATION_METHOD_LABELS[method] || null,
      schedule,
      summary: {
        purchase_cost,
        salvage_value: salvage_value || 0,
        total_depreciation: schedule[schedule.length - 1].totalDepreciation,
        monthly_avg: schedule[schedule.length - 1].totalDepreciation / schedule.length
      }
    });
  } catch (err) {
    console.error('[GET_DEPRECIATION_PREVIEW_ERROR]', { message: err.message, stack: err.stack, body: req.body });
    res.fail(req.t('asset.failedFetch'), 500, 'GET_PREVIEW_FAILED');
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
