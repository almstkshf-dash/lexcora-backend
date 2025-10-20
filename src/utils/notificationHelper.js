const { notifyUser, notifyAll } = require("../models/appNotificationsModel");

/**
 * Send notification to a specific user
 * @param {Object} params - Notification parameters
 * @param {number} params.recipientId - Target employee ID
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type ('info', 'warning', 'success', 'error', 'system')
 * @param {string} params.relatedType - Related type ('task', 'client request', 'employee', 'event', 'memo', 'none')
 * @param {number} params.createdBy - ID of the user creating the notification
 * @returns {Promise<Object>} Result object with success status and notification ID
 */
const sendNotification = async ({ recipientId, title, message, type = 'info', relatedType = 'none', createdBy }) => {
  try {
    const result = await notifyUser({
      recipientId,
      title,
      message,
      type,
      relatedType,
      createdBy
    });
    return { success: true, notificationId: result.id };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send system-wide notification to all users
 * @param {Object} params - Notification parameters
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - Notification type (defaults to 'system')
 * @param {string} params.relatedType - Related type ('task', 'client request', 'employee', 'event', 'memo', 'none')
 * @param {number} params.createdBy - ID of the user creating the notification
 * @returns {Promise<Object>} Result object with success status and notification ID
 */
const sendSystemNotification = async ({ title, message, type = 'system', relatedType = 'none', createdBy }) => {
  try {
    const result = await notifyAll({
      title,
      message,
      type,
      relatedType,
      createdBy
    });
    return { success: true, notificationId: result.id };
  } catch (error) {
    console.error('Error sending system notification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Predefined notification templates for common actions
 */
const NotificationTemplates = {
  // Task related notifications
  taskAssigned: (employeeName, taskTitle) => ({
    title: 'New Task Assigned',
    titleAr: 'تم تعيين مهمة جديدة',
    message: `You have been assigned a new task: ${taskTitle}`,
    messageAr: `تم تعيينك لمهمة جديدة: ${taskTitle}`,
    type: 'info',
    relatedType: 'task'
  }),

  taskCompleted: (employeeName, taskTitle) => ({
    title: 'Task Completed',
    titleAr: 'تم إنجاز المهمة',
    message: `Task "${taskTitle}" has been completed by ${employeeName}`,
    messageAr: `تم إنجاز المهمة "${taskTitle}" بواسطة ${employeeName}`,
    type: 'success',
    relatedType: 'task'
  }),

  taskOverdue: (taskTitle) => ({
    title: 'Task Overdue',
    titleAr: 'مهمة متأخرة',
    message: `Task "${taskTitle}" is overdue`,
    messageAr: `المهمة "${taskTitle}" متأخرة`,
    type: 'warning',
    relatedType: 'task'
  }),

  // Client request notifications
  clientRequestReceived: (clientName) => ({
    title: 'New Client Request',
    titleAr: 'طلب عميل جديد',
    message: `New request received from ${clientName}`,
    messageAr: `تم استلام طلب جديد من ${clientName}`,
    type: 'info',
    relatedType: 'client request'
  }),

  clientRequestApproved: (clientName) => ({
    title: 'Request Approved',
    titleAr: 'تم الموافقة على الطلب',
    message: `Request from ${clientName} has been approved`,
    messageAr: `تم الموافقة على طلب ${clientName}`,
    type: 'success',
    relatedType: 'client request'
  }),

  // Employee notifications
  employeeJoined: (employeeName) => ({
    title: 'New Employee',
    titleAr: 'موظف جديد',
    message: `${employeeName} has joined the team`,
    messageAr: `${employeeName} انضم إلى الفريق`,
    type: 'info',
    relatedType: 'employee'
  }),

  // Event notifications
  eventReminder: (eventTitle, timeUntil) => ({
    title: 'Event Reminder',
    titleAr: 'تذكير بالحدث',
    message: `"${eventTitle}" starts in ${timeUntil}`,
    messageAr: `"${eventTitle}" يبدأ خلال ${timeUntil}`,
    type: 'info',
    relatedType: 'event'
  }),

  // Memo notifications
  memoReceived: (senderName) => ({
    title: 'New Memo',
    titleAr: 'مذكرة جديدة',
    message: `You received a new memo from ${senderName}`,
    messageAr: `تلقيت مذكرة جديدة من ${senderName}`,
    type: 'info',
    relatedType: 'memo'
  }),

  // System notifications
  systemMaintenance: (maintenanceTime) => ({
    title: 'System Maintenance',
    titleAr: 'صيانة النظام',
    message: `System maintenance scheduled for ${maintenanceTime}`,
    messageAr: `صيانة النظام مجدولة في ${maintenanceTime}`,
    type: 'system',
    relatedType: 'none'
  }),

  systemUpdate: (version) => ({
    title: 'System Update',
    titleAr: 'تحديث النظام',
    message: `System has been updated to version ${version}`,
    messageAr: `تم تحديث النظام إلى الإصدار ${version}`,
    type: 'system',
    relatedType: 'none'
  })
};

/**
 * Send notification using predefined template
 * @param {string} templateName - Name of the template to use
 * @param {Object} templateParams - Parameters for the template
 * @param {Object} notificationParams - Additional notification parameters
 * @returns {Promise<Object>} Result object
 */
const sendTemplatedNotification = async (templateName, templateParams, notificationParams) => {
  const template = NotificationTemplates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  const templateData = template(...templateParams);
  
  return await sendNotification({
    ...notificationParams,
    title: templateData.title,
    message: templateData.message,
    type: templateData.type,
    relatedType: templateData.relatedType
  });
};

module.exports = {
  sendNotification,
  sendSystemNotification,
  sendTemplatedNotification,
  NotificationTemplates
};