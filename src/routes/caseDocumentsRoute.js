const express = require("express");
const router = express.Router();
const caseDocumentsController = require("../controllers/caseDocumentsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// GET /api/case-documents - Get all case documents
router.get("/", caseDocumentsController.getAllCaseDocuments);

// POST /api/case-documents - Create a new case document
router.post("/", authenticateToken, caseDocumentsController.createCaseDocument);

// GET /api/case-documents/:id - Get case document by ID
router.get("/:id", caseDocumentsController.getCaseDocumentById);

// PUT /api/case-documents/:id - Update case document by ID
router.put("/:id", authenticateToken, caseDocumentsController.updateCaseDocument);

// DELETE /api/case-documents/:id - Delete case document by ID
router.delete("/:id", authenticateToken, caseDocumentsController.deleteCaseDocument);

// GET /api/case-documents/case/:caseId - Get all documents for a specific case
router.get("/case/:caseId", caseDocumentsController.getCaseDocumentsByCaseId);

module.exports = router;