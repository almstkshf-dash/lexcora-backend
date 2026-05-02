const assetsModel = require("../models/assetsModel");
const accountingService = require("../services/accountingService");
const { deleteDocumentFiles } = require("../services/storageService");
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

// Create new asset with documents
const createAsset = async (req, res) => {
  try {
    const { 
      name, type, branch_id, issue_date, expiry_date, note, documents, record_type,
      purchase_cost, purchase_date, account_id, depreciation_rate, salvage_value, current_value
    } = req.body;
    
    // Validate required fields
    if (!name || !type || !branch_id) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, type, branch_id"
      });
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
      purchase_cost,
      purchase_date,
      account_id,
      depreciation_rate,
      salvage_value,
      current_value
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
    if (purchase_cost > 0) {
      try {
        await accountingService.postAutomatedEntry('ASSET_PURCHASE', {
          amount: purchase_cost,
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
    const { 
      name, type, branch_id, issue_date, expiry_date, note, documents,
      purchase_cost, purchase_date, account_id, depreciation_rate, salvage_value, current_value
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
      purchase_cost,
      purchase_date,
      account_id,
      depreciation_rate,
      salvage_value,
      current_value
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

    // Update asset status/record (assuming we might want to keep it as 'disposed')
    // For now, we'll just update current_value to 0 and maybe add a note
    await assetsModel.updateAsset(id, {
      ...asset,
      current_value: 0,
      note: `${asset.note || ''}\n[DISPOSED ${disposal_date || new Date().toISOString()}] Reason: ${reason || 'N/A'}`
    }, connection);

    // Automation: Post Journal Entry for Asset Disposal
    await accountingService.postAutomatedEntry('ASSET_DISPOSAL', {
      amount: asset.current_value || 0,
      description: `Disposal of asset: ${asset.name}. Reason: ${reason || 'N/A'}`,
      name: asset.name,
      credit_account_id: asset.account_id, // Credit the asset account
      branch_id: asset.branch_id,
      created_by: req.user?.id
    }, connection);

    await connection.commit();
    res.json({ success: true, message: "Asset disposed successfully" });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    connection.release();
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
  disposeAsset
};
