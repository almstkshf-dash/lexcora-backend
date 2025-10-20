const appNotificationsModel = require("../models/appNotificationsModel");

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 50, offset = 0, type, is_read, related_type } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (is_read !== undefined) filters.is_read = is_read === 'true';
    if (related_type) filters.related_type = related_type;
    if (limit) filters.limit = limit;
    
    const notifications = await appNotificationsModel.getNotificationsWithFilters(userId, filters);
    const unreadCount = await appNotificationsModel.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount,
        total: notifications.length
      }
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await appNotificationsModel.getUnreadCount(userId);
    
    res.json({
      success: true,
      data: { unread_count: count }
    });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const success = await appNotificationsModel.markAsRead(id, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied"
      });
    }
    
    res.json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const affectedRows = await appNotificationsModel.markAllAsRead(userId);
    
    res.json({
      success: true,
      message: `${affectedRows} notifications marked as read`
    });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await appNotificationsModel.getNotificationById(id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found"
      });
    }
    
    // Check if user has access to this notification
    const userId = req.user.id;
    if (notification.recipient_id !== null && notification.recipient_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (err) {
    console.error('Get notification by ID error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const success = await appNotificationsModel.deleteNotification(id, userId);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied"
      });
    }
    
    res.json({
      success: true,
      message: "Notification deleted successfully"
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// Create notification (admin only)
const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', recipient_id = null, related_type = 'none' } = req.body;
    const created_by = req.user.id;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required"
      });
    }
    
    const result = await appNotificationsModel.createNotification({
      title,
      message,
      type,
      recipient_id,
      related_type,
      created_by
    });
    
    res.status(201).json({
      success: true,
      data: { id: result.id },
      message: "Notification created successfully"
    });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationById,
  deleteNotification,
  createNotification
};