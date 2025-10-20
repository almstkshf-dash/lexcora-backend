const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationById,
  deleteNotification,
  createNotification
} = require("../controllers/appNotificationsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Get user notifications with filters
router.get("/", authenticateToken, getUserNotifications);

// Get unread count
router.get("/unread-count", authenticateToken, getUnreadCount);

// Get notification by ID
router.get("/:id", authenticateToken, getNotificationById);

// Mark notification as read
router.put("/:id/read", authenticateToken, markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", authenticateToken, markAllAsRead);

// Delete notification
router.delete("/:id", authenticateToken, deleteNotification);

// Create notification (admin only - can be restricted further)
router.post("/", authenticateToken, createNotification);

module.exports = router;