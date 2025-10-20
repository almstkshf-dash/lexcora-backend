const caseDocumentsService = require("../services/caseDocumentsService");

const getAllCaseDocuments = async (req, res) => {
  try {
    const caseDocuments = await caseDocumentsService.getAllCaseDocuments();
    res.status(200).json({
      success: true,
      data: caseDocuments,
      message: "Case documents retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const createCaseDocument = async (req, res) => {
  try {
    const createdBy = req.user?.id || null;
    const caseDocumentId = await caseDocumentsService.createCaseDocument(req.body, createdBy);
    res.status(201).json({
      success: true,
      data: { id: caseDocumentId },
      message: "Case document created successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateCaseDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user?.id || null;
    const isUpdated = await caseDocumentsService.updateCaseDocument(id, req.body, updatedBy);
    
    if (isUpdated) {
      res.status(200).json({
        success: true,
        message: "Case document updated successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update case document"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteCaseDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBy = req.user?.id || null;
    const isDeleted = await caseDocumentsService.deleteCaseDocument(id, deletedBy);
    
    if (isDeleted) {
      res.status(200).json({
        success: true,
        message: "Case document deleted successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to delete case document"
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getCaseDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const caseDocument = await caseDocumentsService.getCaseDocumentById(id);
    res.status(200).json({
      success: true,
      data: caseDocument,
      message: "Case document retrieved successfully"
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const getCaseDocumentsByCaseId = async (req, res) => {
  try {
    const { caseId } = req.params;
    const caseDocuments = await caseDocumentsService.getCaseDocumentsByCaseId(caseId);
    res.status(200).json({
      success: true,
      data: caseDocuments,
      message: "Case documents retrieved successfully"
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllCaseDocuments,
  createCaseDocument,
  updateCaseDocument,
  deleteCaseDocument,
  getCaseDocumentById,
  getCaseDocumentsByCaseId
};