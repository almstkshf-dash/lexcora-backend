const express = require("express");
const router = express.Router();
const courtCaseDocumentsController = require("../controllers/courtCaseDocumentsController");
const { paginationValidator, sortValidator } = require("../middlewares/validators");

// GET /api/court-case-documents - Get all court case documents
router.get(
  "/",
  paginationValidator,
  sortValidator(['created_at', 'id']),
  courtCaseDocumentsController.getAllCourtCaseDocuments
);

// POST /api/court-case-documents - Create a new court case document relationship
router.post("/", courtCaseDocumentsController.createCourtCaseDocument);

// GET /api/court-case-documents/:id - Get court case document by ID
router.get("/:id", courtCaseDocumentsController.getCourtCaseDocumentById);

// PUT /api/court-case-documents/:id - Update court case document by ID
router.put("/:id", courtCaseDocumentsController.updateCourtCaseDocument);

// DELETE /api/court-case-documents/:id - Delete court case document by ID
router.delete("/:id", courtCaseDocumentsController.deleteCourtCaseDocument);

// GET /api/court-case-documents/court/:courtId - Get all case documents for a specific court
router.get("/court/:courtId", courtCaseDocumentsController.getCourtCaseDocumentsByCourtId);

// GET /api/court-case-documents/document/:caseDocumentId - Get all courts for a specific case document
router.get("/document/:caseDocumentId", courtCaseDocumentsController.getCourtCaseDocumentsByCaseDocumentId);

// GET /api/court-case-documents/status/:status - Get documents by status
router.get("/status/:status", courtCaseDocumentsController.getCourtCaseDocumentsByStatus);

// GET /api/court-case-documents/date-range - Get documents by date range (query params: startDate, endDate)
router.get("/date-range", courtCaseDocumentsController.getCourtCaseDocumentsByDateRange);

module.exports = router;
