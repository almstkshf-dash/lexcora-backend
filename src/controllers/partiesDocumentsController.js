const partiesDocumentsService = require("../services/partiesDocumentsService");
const { normalizePagination } = require("../utils/pagination");

const getAllPartiesDocuments = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['created_at', 'id']);
    const result = await partiesDocumentsService.listPartiesDocuments({ page, limit, sortBy, sortOrder });
    res.success(result.data, req.t('generic.ok'), 200, result.pagination);
  } catch (error) {
    res.fail("Error fetching parties documents", 500, "PARTIES_DOCS_LIST_ERROR");
  }
};

const getPartiesDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await partiesDocumentsService.getPartiesDocument(id);
    res.status(200).json({
      success: true,
      data: document
    });
  } catch (error) {
    const status = error.message === "Parties document not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const getDocumentsByPartyId = async (req, res) => {
  try {
    const { partyId } = req.params;
    const documents = await partiesDocumentsService.getDocumentsByParty(partyId);
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    const status = error.message === "Party not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const createPartiesDocument = async (req, res) => {
  try {
    const documentData = req.body;
    const newDocument = await partiesDocumentsService.addPartiesDocument(documentData);
    res.status(201).json({
      success: true,
      message: "Parties document created successfully",
      data: newDocument
    });
  } catch (error) {
    const status = error.message.includes("Missing required fields") ||
                   error.message.includes("must be") ||
                   error.message.includes("Party not found") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const updatePartiesDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const documentData = req.body;
    const updatedDocument = await partiesDocumentsService.updatePartiesDocument(id, documentData);
    res.status(200).json({
      success: true,
      message: "Parties document updated successfully",
      data: updatedDocument
    });
  } catch (error) {
    const status = error.message === "Parties document not found" ? 404 :
                   error.message.includes("must be") ||
                   error.message.includes("Party not found") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const deletePartiesDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await partiesDocumentsService.removePartiesDocument(id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const status = error.message === "Parties document not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const getDocumentsByFileType = async (req, res) => {
  try {
    const { fileType } = req.params;
    const documents = await partiesDocumentsService.getDocumentsByFileType(fileType);
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    const status = error.message.includes("must be") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const searchPartiesDocuments = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query parameter 'q' is required"
      });
    }

    const documents = await partiesDocumentsService.searchPartiesDocuments(q);
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    const status = error.message.includes("must be") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const getDocumentsStatistics = async (req, res) => {
  try {
    const stats = await partiesDocumentsService.getDocumentsStatistics();
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching documents statistics",
      error: error.message
    });
  }
};

const uploadPartiesDocument = async (req, res) => {
  try {
    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const { party_id } = req.body;
    
    if (!party_id) {
      return res.status(400).json({
        success: false,
        message: "Party ID is required"
      });
    }

    const { uploadToBlob } = require('../utils/blobStorage');
    const path = require('path');

    const folder = 'parties-documents';

    // Upload all files and create document records
    const uploadPromises = req.files.map(async (file) => {
      // Generate unique filename/path
      let originalFilename = file.originalname;
      
      // Handle Arabic filenames
      try {
        if (/[^\x00-\x7F]/.test(originalFilename)) {
          originalFilename = Buffer.from(originalFilename, 'latin1').toString('utf8');
        }
      } catch (error) {
        console.warn('Failed to decode filename:', originalFilename);
      }

      const fileExtension = path.extname(originalFilename);
      const cleanName = originalFilename.replace(fileExtension, '').replace(/[^a-zA-Z0-9]/g, '_');
      const blobPath = `${folder}/${cleanName}-${Date.now()}${fileExtension}`;

      // Upload to Vercel Blob
      const blob = await uploadToBlob(blobPath, file.buffer, file.mimetype);

      // Create document record in database
      const documentData = {
        party_id: party_id,
        file_name: originalFilename,
        url: blob.url,
        uploaded_by: req.user?.id || null
      };

      return await partiesDocumentsService.addPartiesDocument(documentData);
    });

    const uploadedDocuments = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      message: `${uploadedDocuments.length} file(s) uploaded successfully`,
      data: uploadedDocuments
    });
  } catch (error) {
    console.error('Error uploading parties documents to Vercel Blob:', error);
    const status = error.message.includes("Missing required fields") ||
                   error.message.includes("must be") ||
                   error.message.includes("Party not found") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllPartiesDocuments,
  getPartiesDocumentById,
  getDocumentsByPartyId,
  createPartiesDocument,
  updatePartiesDocument,
  deletePartiesDocument,
  getDocumentsByFileType,
  searchPartiesDocuments,
  getDocumentsStatistics,
  uploadPartiesDocument
};
