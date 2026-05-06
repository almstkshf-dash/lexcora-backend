const express = require("express");
const router = express.Router();
const { getNotifications } = require("../controllers/hrNotificationsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Notifications routes
router.get("/", authenticateToken, getNotifications);        // GET /notifications

module.exports = router;
