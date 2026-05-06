const express = require("express");
const router = express.Router();
const {
  getAssets,
  getAsset,
  getAssetDocuments,
  createAsset,
  updateAsset,
  deleteAsset,
  deleteAssetDocument,
  disposeAsset,
  transferAsset,
  getAssetTransfers,
  revalueAsset,
  getAssetRevaluations,
  getDepreciationSchedule,
  getCurrentMonthDepreciation,
  updateDepreciationSettings,
  getDepreciationPreview,
  getDepreciationMethods
} = require("../controllers/assetsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Assets routes
router.get("/", authenticateToken, getAssets);
router.get("/:id", authenticateToken, getAsset);
router.get("/:id/documents", authenticateToken, getAssetDocuments);
router.post("/", authenticateToken, createAsset);
router.post("/:id/dispose", authenticateToken, disposeAsset);

// Asset transfer tracking: record moves between branches/custodians and preserve history.
router.post("/:id/transfer", authenticateToken, transferAsset);
router.get("/:id/transfers", authenticateToken, getAssetTransfers);

// Asset revaluation: update book value and keep revaluation history for audit.
router.post("/:id/revalue", authenticateToken, revalueAsset);
router.get("/:id/revaluations", authenticateToken, getAssetRevaluations);

router.put("/:id", authenticateToken, updateAsset);
router.delete("/:id", authenticateToken, deleteAsset);
router.delete("/:id/documents/:documentId", authenticateToken, deleteAssetDocument);

// Depreciation routes
router.get("/:id/depreciation/schedule", authenticateToken, getDepreciationSchedule);
router.get("/:id/depreciation/current-month", authenticateToken, getCurrentMonthDepreciation);
router.get("/depreciation/methods", authenticateToken, getDepreciationMethods);
router.put("/:id/depreciation/settings", authenticateToken, updateDepreciationSettings);
router.post("/depreciation/preview", authenticateToken, getDepreciationPreview);

module.exports = router;
