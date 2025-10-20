const assetsModel = require("../models/assetsModel");
const { deleteDocumentFiles } = require("../services/cloudflareService");

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
    const { name, type, branch_id, issue_date, expiry_date, note, documents, record_type } = req.body;
    
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
      record_type: record_type || 'resource' // Default to 'resource' if not provided
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
    const { name, type, branch_id, issue_date, expiry_date, note, documents } = req.body;
    
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
      note: note || null
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

// Delete asset and all its documents (from DB and Cloudflare R2)
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
    
    // Delete files from Cloudflare R2
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

// Delete single asset document (from DB and Cloudflare R2)
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
    
    // Delete file from Cloudflare R2
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

module.exports = {
  getAssets,
  getAsset,
  getAssetDocuments,
  createAsset,
  updateAsset,
  deleteAsset,
  deleteAssetDocument
};
