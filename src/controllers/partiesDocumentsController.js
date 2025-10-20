const partiesDocumentsService = require("../services/partiesDocumentsService");

const getAllPartiesDocuments = async (req, res) => {
  try {
    const documents = await partiesDocumentsService.listPartiesDocuments();
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching parties documents",
      error: error.message
    });
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
    // This would handle file upload logic
    // The actual file upload would be handled by middleware like multer
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const documentData = {
      party_id: req.body.party_id,
      file_name: req.file.originalname,
      url: req.file.path || req.file.url, // depending on storage method
      file_size: req.file.size,
      file_type: req.file.mimetype,
      description: req.body.description
    };

    const newDocument = await partiesDocumentsService.addPartiesDocument(documentData);
    res.status(201).json({
      success: true,
      message: "File uploaded and document created successfully",
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