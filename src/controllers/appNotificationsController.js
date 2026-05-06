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
    
    res.success({
      notifications,
      unread_count: unreadCount,
      total: notifications.length
    });
  } catch (err) {
    console.error('[GET_NOTIFICATIONS_ERROR]', { message: err.message, stack: err.stack, userId: req.user.id, query: req.query });
    res.fail(req.t('notifications.failedFetch'), 500, 'GET_NOTIFICATIONS_FAILED');
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await appNotificationsModel.getUnreadCount(userId);
    
    res.success({ unread_count: count });
  } catch (err) {
    console.error('[GET_UNREAD_COUNT_ERROR]', { message: err.message, stack: err.stack, userId: req.user.id });
    res.fail(req.t('notifications.failedFetch'), 500, 'GET_UNREAD_COUNT_FAILED');
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
    
    res.success(null, req.t('generic.ok'));
  } catch (err) {
    console.error('[MARK_AS_READ_ERROR]', { message: err.message, stack: err.stack, userId: req.user.id, params: req.params });
    res.fail(req.t('notifications.failedMarkRead'), 500, 'MARK_AS_READ_FAILED');
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const affectedRows = await appNotificationsModel.markAllAsRead(userId);
    
    res.success({ affectedRows }, req.t('notifications.markedAllRead'));
  } catch (err) {
    console.error('[MARK_ALL_READ_ERROR]', { message: err.message, stack: err.stack, userId: req.user.id });
    res.fail(req.t('notifications.failedMarkRead'), 500, 'MARK_ALL_READ_FAILED');
  }
};

// Get notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await appNotificationsModel.getNotificationById(id);
    
    if (!notification) {
      return res.fail(req.t('notifications.notFound'), 404, 'NOTIFICATION_NOT_FOUND');
    }
    
    // Check if user has access to this notification
    const userId = req.user.id;
    if (notification.recipient_id !== null && notification.recipient_id !== userId) {
      return res.fail(req.t('notifications.accessDenied'), 403, 'ACCESS_DENIED');
    }
    
    res.success(notification);
  } catch (err) {
    console.error('[GET_NOTIFICATION_BY_ID_ERROR]', { message: err.message, stack: err.stack, userId: req.user.id, params: req.params });
    res.fail(req.t('notifications.failedFetch'), 500, 'GET_NOTIFICATION_FAILED');
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    const success = await appNotificationsModel.deleteNotification(id, userId);
    
    if (!success) {
      return res.fail(req.t('notifications.notFound'), 404, 'NOTIFICATION_NOT_FOUND');
    }
    
    res.success(null, req.t('generic.ok'));
  } catch (err) {
    console.error('[DELETE_NOTIFICATION_ERROR]', { message: err.message, stack: err.stack, userId: req.user.id, params: req.params });
    res.fail(req.t('notifications.failedDelete'), 500, 'DELETE_NOTIFICATION_FAILED');
  }
};

// Create notification (admin only)
const createNotification = async (req, res) => {
  try {
    const { title, message, type = 'info', recipient_id = null, related_type = 'none' } = req.body;
    const created_by = req.user.id;
    
    if (!title || !message) {
      return res.fail(req.t('notifications.titleMessageRequired'), 400, 'MISSING_FIELDS');
    }
    
    const result = await appNotificationsModel.createNotification({
      title,
      message,
      type,
      recipient_id,
      related_type,
      created_by
    });
    
    res.created({ id: result.id }, req.t('generic.created'));
  } catch (err) {
    console.error('[CREATE_NOTIFICATION_ERROR]', { message: err.message, stack: err.stack, userId: req.user.id, body: req.body });
    res.fail(req.t('notifications.failedCreate'), 500, 'CREATE_NOTIFICATION_FAILED');
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