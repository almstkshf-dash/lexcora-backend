const courtCaseDocumentsService = require("../services/courtCaseDocumentsService");

const getAllCourtCaseDocuments = async (req, res) => {
  try {
    const courtCaseDocuments = await courtCaseDocumentsService.getAllCourtCaseDocuments();
    res.status(200).json({
      success: true,
      data: courtCaseDocuments,
      message: "Court case documents retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCourtCaseDocument = async (req, res) => {
  try {
    const courtCaseDocumentId = await courtCaseDocumentsService.createCourtCaseDocument(req.body);
    res.status(201).json({
      success: true,
      data: { id: courtCaseDocumentId },
      message: "Court case document created successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateCourtCaseDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const isUpdated = await courtCaseDocumentsService.updateCourtCaseDocument(id, req.body);
    
    if (isUpdated) {
      res.status(200).json({
        success: true,
        message: "Court case document updated successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update court case document"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCourtCaseDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const isDeleted = await courtCaseDocumentsService.deleteCourtCaseDocument(id);
    
    if (isDeleted) {
      res.status(200).json({
        success: true,
        message: "Court case document deleted successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete court case document"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getCourtCaseDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const courtCaseDocument = await courtCaseDocumentsService.getCourtCaseDocumentById(id);
    res.status(200).json({
      success: true,
      data: courtCaseDocument,
      message: "Court case document retrieved successfully"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const getCourtCaseDocumentsByCourtId = async (req, res) => {
  try {
    const { courtId } = req.params;
    const courtCaseDocuments = await courtCaseDocumentsService.getCourtCaseDocumentsByCourtId(courtId);
    res.status(200).json({
      success: true,
      data: courtCaseDocuments,
      message: "Court case documents retrieved successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getCourtCaseDocumentsByCaseDocumentId = async (req, res) => {
  try {
    const { caseDocumentId } = req.params;
    const courtCaseDocuments = await courtCaseDocumentsService.getCourtCaseDocumentsByCaseDocumentId(caseDocumentId);
    res.status(200).json({
      success: true,
      data: courtCaseDocuments,
      message: "Court case documents retrieved successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getCourtCaseDocumentsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const courtCaseDocuments = await courtCaseDocumentsService.getCourtCaseDocumentsByStatus(status);
    res.status(200).json({
      success: true,
      data: courtCaseDocuments,
      message: "Court case documents retrieved successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getCourtCaseDocumentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const courtCaseDocuments = await courtCaseDocumentsService.getCourtCaseDocumentsByDateRange(startDate, endDate);
    res.status(200).json({
      success: true,
      data: courtCaseDocuments,
      message: "Court case documents retrieved successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllCourtCaseDocuments,
  createCourtCaseDocument,
  updateCourtCaseDocument,
  deleteCourtCaseDocument,
  getCourtCaseDocumentById,
  getCourtCaseDocumentsByCourtId,
  getCourtCaseDocumentsByCaseDocumentId,
  getCourtCaseDocumentsByStatus,
  getCourtCaseDocumentsByDateRange
};