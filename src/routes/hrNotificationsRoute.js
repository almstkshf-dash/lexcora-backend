const express = require("express");
const router = express.Router();
const { getNotifications } = require("../controllers/hrNotificationsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Notifications routes
router.get("/", authenticateToken, getNotifications);        // GET /notifications

module.exports = router;