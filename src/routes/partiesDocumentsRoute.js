const express = require("express");
const partiesDocumentsController = require("../controllers/partiesDocumentsController");
const { upload } = require("../controllers/uploadController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { paginationValidator, sortValidator } = require("../middlewares/validators");

const router = express.Router();

// Get all parties documents
router.get(
  "/",
  authenticateToken,
  paginationValidator,
  sortValidator(['created_at', 'id']),
  partiesDocumentsController.getAllPartiesDocuments
);

// Search parties documents
router.get("/search", authenticateToken, partiesDocumentsController.searchPartiesDocuments);

// Get documents statistics
router.get("/statistics", authenticateToken, partiesDocumentsController.getDocumentsStatistics);

// Get documents by file type
router.get("/type/:fileType", authenticateToken, partiesDocumentsController.getDocumentsByFileType);

// Get documents by party ID
router.get("/party/:partyId", authenticateToken, partiesDocumentsController.getDocumentsByPartyId);

// Get parties document by ID
router.get("/:id", authenticateToken, partiesDocumentsController.getPartiesDocumentById);

// Create new parties document
router.post("/", authenticateToken, partiesDocumentsController.createPartiesDocument);

// Upload file and create document (requires file upload middleware)
router.post("/upload", authenticateToken, upload.array('files', 10), partiesDocumentsController.uploadPartiesDocument);

// Update parties document
router.put("/:id", authenticateToken, partiesDocumentsController.updatePartiesDocument);

// Delete parties document
router.delete("/:id", authenticateToken, partiesDocumentsController.deletePartiesDocument);

module.exports = router;

