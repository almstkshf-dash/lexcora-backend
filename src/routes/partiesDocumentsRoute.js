const express = require("express");
const partiesDocumentsController = require("../controllers/partiesDocumentsController");

const router = express.Router();

// Get all parties documents
router.get("/", partiesDocumentsController.getAllPartiesDocuments);

// Search parties documents
router.get("/search", partiesDocumentsController.searchPartiesDocuments);

// Get documents statistics
router.get("/statistics", partiesDocumentsController.getDocumentsStatistics);

// Get documents by file type
router.get("/type/:fileType", partiesDocumentsController.getDocumentsByFileType);

// Get documents by party ID
router.get("/party/:partyId", partiesDocumentsController.getDocumentsByPartyId);

// Get parties document by ID
router.get("/:id", partiesDocumentsController.getPartiesDocumentById);

// Create new parties document
router.post("/", partiesDocumentsController.createPartiesDocument);

// Upload file and create document (requires file upload middleware)
router.post("/upload", partiesDocumentsController.uploadPartiesDocument);

// Update parties document
router.put("/:id", partiesDocumentsController.updatePartiesDocument);

// Delete parties document
router.delete("/:id", partiesDocumentsController.deletePartiesDocument);

module.exports = router;