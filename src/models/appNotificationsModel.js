const db = require("../config/db");

// Create a new app notification
const createNotification = async ({ title, message, type = 'info', recipient_id = null, related_type = 'none', created_by }) => {
  try {
    const query = `
      INSERT INTO app_notifications (title, message, type, recipient_id, related_type, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [title, message, type, recipient_id, related_type, created_by]);
    console.log('Notification created successfully:', result);
    return { id: result.insertId, success: true };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Get notifications for a specific user (including system-wide notifications)
const getUserNotifications = async (userId, limit = 50, offset = 0) => {
  try {
    const query = `
      SELECT 
        an.*,
        e.name as created_by_name
      FROM app_notifications an
      LEFT JOIN employees e ON an.created_by = e.id
      WHERE an.recipient_id = ? OR an.recipient_id IS NULL
      ORDER BY an.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query(query, [userId, limit, offset]);
    return rows;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

// Get unread notifications count for a user
const getUnreadCount = async (userId) => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM app_notifications
      WHERE (recipient_id = ? OR recipient_id IS NULL) AND is_read = FALSE
    `;
    const [rows] = await db.query(query, [userId]);
    return rows[0].count;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  try {
    const query = `
      UPDATE app_notifications 
      SET is_read = TRUE 
      WHERE id = ? AND (recipient_id = ? OR recipient_id IS NULL)
    `;
    const [result] = await db.query(query, [notificationId, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
  try {
    const query = `
      UPDATE app_notifications 
      SET is_read = TRUE 
      WHERE (recipient_id = ? OR recipient_id IS NULL) AND is_read = FALSE
    `;
    const [result] = await db.query(query, [userId]);
    return result.affectedRows;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get notification by ID
const getNotificationById = async (id) => {
  try {
    const query = `
      SELECT 
        an.*,
        e.name as created_by_name
      FROM app_notifications an
      LEFT JOIN employees e ON an.created_by = e.id
      WHERE an.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching notification by ID:', error);
    throw error;
  }
};

// Delete notification
const deleteNotification = async (id, userId) => {
  try {
    const query = `
      DELETE FROM app_notifications 
      WHERE id = ? AND (recipient_id = ? OR recipient_id IS NULL)
    `;
    const [result] = await db.query(query, [id, userId]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Utility function to send notification to specific user
const notifyUser = async ({ recipientId, title, message, type = 'info', relatedType = 'none', createdBy }) => {
  return await createNotification({
    title,
    message,
    type,
    recipient_id: recipientId,
    related_type: relatedType,
    created_by: createdBy
  });
};

// Utility function to send system-wide notification
const notifyAll = async ({ title, message, type = 'system', relatedType = 'none', createdBy }) => {
  return await createNotification({
    title,
    message,
    type,
    recipient_id: null, // null means system-wide
    related_type: relatedType,
    created_by: createdBy
  });
};

// Get notifications with filters
const getNotificationsWithFilters = async (userId, filters = {}) => {
  try {
    let query = `
      SELECT 
        an.*,
        e.name as created_by_name
      FROM app_notifications an
      LEFT JOIN employees e ON an.created_by = e.id
      WHERE (an.recipient_id = ? OR an.recipient_id IS NULL)
    `;
    
    const params = [userId];
    
    if (filters.type) {
      query += ` AND an.type = ?`;
      params.push(filters.type);
    }
    
    if (filters.is_read !== undefined) {
      query += ` AND an.is_read = ?`;
      params.push(filters.is_read);
    }
    
    if (filters.related_type) {
      query += ` AND an.related_type = ?`;
      params.push(filters.related_type);
    }
    
    query += ` ORDER BY an.created_at DESC`;
    
    if (filters.limit) {
      query += ` LIMIT ?`;
      params.push(parseInt(filters.limit));
    }
    
    const [rows] = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching filtered notifications:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getNotificationById,
  deleteNotification,
  notifyUser,
  notifyAll,
  getNotificationsWithFilters
};