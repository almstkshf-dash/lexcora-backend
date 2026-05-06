const warningsModel = require("../models/warningsModel");
const { deleteDocumentFiles } = require("../services/storageService");
const { normalizePagination } = require("../utils/pagination");

// Get all warnings or by employee_id
const getWarnings = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['created_at', 'id', 'date']);
    const warningsResult = await warningsModel.getAllWarnings(employee_id || null, { page, limit, sortBy, sortOrder });
    const warnings = warningsResult.rows || warningsResult.data || warningsResult;
    const pagination = warningsResult.pagination || (warningsResult.total ? {
      total: warningsResult.total,
      page,
      limit,
      totalPages: Math.ceil(warningsResult.total / limit)
    } : undefined);
    
    const warningsWithDocs = await Promise.all(
      warnings.map(async (warning) => {
        const documents = await warningsModel.getWarningDocuments(warning.id);
        return {
          ...warning,
          documents_count: documents.length
        };
      })
    );
    
    res.success(warningsWithDocs, req.t('generic.ok'), 200, pagination);
  } catch (err) {
    console.error('[GET_WARNINGS_ERROR]', { message: err.message, stack: err.stack, query: req.query });
    res.fail(req.t('warning.failedFetch'), 500, 'WARNINGS_LIST_ERROR');
  }
};

// Get warning by ID with documents
const getWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const warning = await warningsModel.getWarningById(id);
    
    if (!warning) {
      return res.fail(req.t('warning.notFound'), 404, 'NOT_FOUND');
    }
    
    // Get documents
    const documents = await warningsModel.getWarningDocuments(id);
    
    res.success({
      ...warning,
      documents
    });
  } catch (err) {
    console.error('[GET_WARNING_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(req.t('warning.failedFetch'), 500, 'GET_WARNING_FAILED');
  }
};

// Get warning documents
const getWarningDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const documents = await warningsModel.getWarningDocuments(id);
    
    res.success(documents, req.t('generic.ok'), 200, {
      count: documents.length
    });
  } catch (err) {
    console.error('[GET_WARNING_DOCS_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(req.t('warning.failedFetch'), 500, 'GET_WARNING_DOCS_FAILED');
  }
};

// Create new warning with documents
const createWarning = async (req, res) => {
  try {
    const { employee_id, date, type, reason, documents } = req.body;
    
    // Validate required fields
    if (!employee_id || !date || !type || !reason) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    // Validate type enum
    if (!['verbal', 'written'].includes(type)) {
      return res.fail(req.t('generic.validationError'), 400, 'INVALID_TYPE');
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
    
    res.created({
      ...newWarning,
      documents: warningDocuments
    }, req.t('generic.created'));
  } catch (err) {
    console.error('[CREATE_WARNING_ERROR]', { message: err.message, stack: err.stack, body: req.body });
    res.fail(req.t('warning.failedCreate'), 500, 'CREATE_WARNING_FAILED');
  }
};

// Update warning
const updateWarning = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, type, reason, documents } = req.body;
    
    // Validate required fields
    if (!date || !type || !reason) {
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
    }
    
    // Validate type enum
    if (!['verbal', 'written'].includes(type)) {
      return res.fail(req.t('generic.validationError'), 400, 'INVALID_TYPE');
    }
    
    // Check if warning exists
    const existingWarning = await warningsModel.getWarningById(id);
    if (!existingWarning) {
      return res.fail(req.t('warning.notFound'), 404, 'NOT_FOUND');
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
    
    res.success({
      ...updatedWarning,
      documents: warningDocuments
    }, req.t('generic.ok'));
  } catch (err) {
    console.error('[UPDATE_WARNING_ERROR]', { id: req.params.id, message: err.message, stack: err.stack, body: req.body });
    res.fail(req.t('warning.failedUpdate'), 500, 'UPDATE_WARNING_FAILED');
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
      return res.fail(req.t('generic.notFound'), 404, 'NOT_FOUND');
    }
    
    // Delete from database
    await warningsModel.deleteWarningDocument(documentId, warningId);
    
    // Delete file from Cloudflare R2
    if (documentToDelete.document_url) {
      await deleteDocumentFiles([documentToDelete]);
    }
    
    res.success(null, req.t('generic.ok'));
  } catch (err) {
    console.error('[DELETE_WARNING_DOC_ERROR]', { params: req.params, message: err.message, stack: err.stack });
    res.fail(req.t('generic.failedDelete'), 500, 'DELETE_WARNING_DOC_FAILED');
  }
};

// Delete warning (and all documents)
const deleteWarning = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if warning exists
    const existingWarning = await warningsModel.getWarningById(id);
    if (!existingWarning) {
      return res.fail(req.t('warning.notFound'), 404, 'NOT_FOUND');
    }
    
    // Get documents before deleting
    const documents = await warningsModel.getWarningDocuments(id);
    
    // Delete from database (cascade will delete document records)
    await warningsModel.deleteWarning(id);
    
    // Delete files from Cloudflare R2
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }
    
    res.success(null, req.t('generic.ok'));
  } catch (err) {
    console.error('[DELETE_WARNING_ERROR]', { id: req.params.id, message: err.message, stack: err.stack });
    res.fail(req.t('warning.failedDelete'), 500, 'DELETE_WARNING_FAILED');
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
