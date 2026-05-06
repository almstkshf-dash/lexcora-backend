const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settingsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionMiddleware");

// Both viewing and managing require authentication
// Viewing settings might be needed by many, but managing is restricted
router.get("/", authenticateToken, settingsController.getSettings);
router.put("/", authenticateToken, checkPermission('manage_settings'), settingsController.updateSettings);

module.exports = router;
