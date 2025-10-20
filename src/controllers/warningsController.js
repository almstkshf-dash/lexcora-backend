const warningsModel = require("../models/warningsModel");
const { deleteDocumentFiles } = require("../services/cloudflareService");

// Get all warnings or by employee_id
const getWarnings = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const warnings = await warningsModel.getAllWarnings(employee_id || null);
    
    // Get documents count for each warning
    const warningsWithDocs = await Promise.all(
      warnings.map(async (warning) => {
        const documents = await warningsModel.getWarningDocuments(warning.id);
        return {
          ...warning,
          documents_count: documents.length
        };
      })
    );
    
    res.json({
      success: true,
      data: warningsWithDocs,
      count: warningsWithDocs.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get warning by ID with documents
const getWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const warning = await warningsModel.getWarningById(id);
    
    if (!warning) {
      return res.status(404).json({
        success: false,
        message: "Warning not found"
      });
    }
    
    // Get documents
    const documents = await warningsModel.getWarningDocuments(id);
    
    res.json({
      success: true,
      data: {
        ...warning,
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

// Get warning documents
const getWarningDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await warningsModel.getWarningDocuments(id);
    
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

// Create new warning with documents
const createWarning = async (req, res) => {
  try {
    const { employee_id, date, type, reason, documents } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !type || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: employee_id, date, type, reason"
      });
    }
    
    // Validate type enum
    if (!['verbal', 'written'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'verbal' or 'written'"
      });
    }
    
    // Get created_by from authenticated user
    const created_by = req.user.id;
    
    // Create warning
    const warningData = {
      employee_id,
      date,
      type,
      reason,
      created_by
    };
    
    const warningId = await warningsModel.createWarning(warningData);
    
    // Add documents if provided
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.document_name && doc.document_url) {
          await warningsModel.createWarningDocument({
            warning_id: warningId,
            document_name: doc.document_name,
            document_url: doc.document_url,
            created_by
          });
        }
      }
    }
    
    // Fetch the created warning with full details
    const newWarning = await warningsModel.getWarningById(warningId);
    const warningDocuments = await warningsModel.getWarningDocuments(warningId);
    
    res.status(201).json({
      success: true,
      message: "Warning created successfully",
      data: {
        ...newWarning,
        documents: warningDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update warning
const updateWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, reason, documents } = req.body;
    
    // Validate required fields
    if (!date || !type || !reason) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: date, type, reason"
      });
    }
    
    // Validate type enum
    if (!['verbal', 'written'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'verbal' or 'written'"
      });
    }
    
    // Check if warning exists
    const existingWarning = await warningsModel.getWarningById(id);
    if (!existingWarning) {
      return res.status(404).json({
        success: false,
        message: "Warning not found"
      });
    }
    
    // Update warning
    const warningData = {
      date,
      type,
      reason
    };
    
    await warningsModel.updateWarning(id, warningData);
    
    // Add new documents if provided
    const created_by = req.user.id;
    if (documents && Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (doc.document_name && doc.document_url) {
          await warningsModel.createWarningDocument({
            warning_id: id,
            document_name: doc.document_name,
            document_url: doc.document_url,
            created_by
          });
        }
      }
    }
    
    // Fetch the updated warning with documents
    const updatedWarning = await warningsModel.getWarningById(id);
    const warningDocuments = await warningsModel.getWarningDocuments(id);
    
    res.json({
      success: true,
      message: "Warning updated successfully",
      data: {
        ...updatedWarning,
        documents: warningDocuments
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete warning document
const deleteWarningDocument = async (req, res) => {
  try {
    const { warningId, documentId } = req.params;
    
    // Get documents before deleting
    const documents = await warningsModel.getWarningDocuments(warningId);
    const documentToDelete = documents.find(doc => doc.id === parseInt(documentId));
    
    if (!documentToDelete) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }
    
    // Delete from database
    await warningsModel.deleteWarningDocument(documentId, warningId);
    
    // Delete file from Cloudflare R2
    if (documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    res.json({
      success: true,
      message: "Document deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting warning document:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete warning (and all documents)
const deleteWarning = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if warning exists
    const existingWarning = await warningsModel.getWarningById(id);
    if (!existingWarning) {
      return res.status(404).json({
        success: false,
        message: "Warning not found"
      });
    }
    
    // Get documents before deleting
    const documents = await warningsModel.getWarningDocuments(id);
    
    // Delete from database (cascade will delete document records)
    await warningsModel.deleteWarning(id);
    
    // Delete files from Cloudflare R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    res.json({
      success: true,
      message: "Warning deleted successfully"
    });
  } catch (err) {
    console.error('Error deleting warning:', err);
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getWarnings,
  getWarning,
  getWarningDocuments,
  createWarning,
  updateWarning,
  deleteWarningDocument,
  deleteWarning
};
