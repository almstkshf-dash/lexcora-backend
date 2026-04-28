const employeeDocumentsModel = require('../models/employeeDocumentsModel');

/**
 * Upload employee document
 */
const uploadDocument = async (req, res) => {
  try {
    const { employee_id, document_type, document_name, document_url } = req.body;
    const uploaded_by = req.user?.id || req.user?.employee_id;

    // Validate required fields
    if (!employee_id || !document_type || !document_name || !document_url) {
      return res.status(400).json({
        success: false,
        error: 'Employee ID, document type, document name, and document URL are required',
      });
    }

    // Validate document type
    const validTypes = ['cv', 'id', 'passport', 'insurance', 'contract', 'good_conduct', 'work_permit', 'education_certificate', 'others'];
    if (!validTypes.includes(document_type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid document type',
      });
    }

    // Save to database
    const documentId = await employeeDocumentsModel.create({
      employee_id,
      document_type,
      document_name,
      document_url,
      uploaded_by,
    });

    // Get the created document
    const document = await employeeDocumentsModel.getById(documentId);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload document',
      details: error.message,
    });
  }
};

/**
 * Get all documents for an employee
 */
const getEmployeeDocuments = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const documents = await employeeDocumentsModel.getByEmployeeId(employeeId);

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      details: error.message,
    });
  }
};

/**
 * Get documents by type for an employee
 */
const getEmployeeDocumentsByType = async (req, res) => {
  try {
    const { employeeId, type } = req.params;

    const documents = await employeeDocumentsModel.getByEmployeeIdAndType(employeeId, type);

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
      details: error.message,
    });
  }
};

/**
 * Get document count by type for an employee
 */
const getDocumentCountByType = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const counts = await employeeDocumentsModel.getCountByType(employeeId);

    res.status(200).json({
      success: true,
      data: counts,
    });
  } catch (error) {
    console.error('Error fetching document counts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document counts',
      details: error.message,
    });
  }
};

/**
 * Delete a document
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document info first
    const document = await employeeDocumentsModel.getById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Delete from storage (Vercel Blob via storageService)
    const { deleteFile } = require('../services/storageService');
    await deleteFile(document.document_url);

    // Delete from database
    await employeeDocumentsModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document',
      details: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getEmployeeDocuments,
  getEmployeeDocumentsByType,
  getDocumentCountByType,
  deleteDocument,
};
