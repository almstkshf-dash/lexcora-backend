const express = require("express");
const router = express.Router();
const {
  getAssets,
  getAsset,
  getAssetDocuments,
  createAsset,
  updateAsset,
  deleteAsset,
  deleteAssetDocument
} = require("../controllers/assetsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Assets routes
router.get("/", authenticateToken, getAssets);
router.get("/:id", authenticateToken, getAsset);
router.get("/:id/documents", authenticateToken, getAssetDocuments);
router.post("/", authenticateToken, createAsset);
router.put("/:id", authenticateToken, updateAsset);
router.delete("/:id", authenticateToken, deleteAsset);
router.delete("/:id/documents/:documentId", authenticateToken, deleteAssetDocument);

module.exports = router;
