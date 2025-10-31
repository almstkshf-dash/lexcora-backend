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

/**
 * Send system notification for case creation/update
 * @param {Object} params - Parameters
 * @param {string} params.action - 'created' or 'updated'
 * @param {string} params.caseNumber - Case number for reference
 * @param {string} params.employeeName - Name of the employee who created/updated the case
 * @param {number} params.createdBy - ID of the user creating/updating the case
 * @returns {Promise<void>}
 */
async function sendCaseNotification({ action = 'created', caseNumber, employeeName, createdBy }) {
  const actionText = action === 'created' ? 'تم إنشاء ملف جديد' : 'تم تحديث الملف';
  const messageText = action === 'created' 
    ? `${employeeName} أضاف ملف جديد: ${caseNumber}`
    : `${employeeName} قام بتحديث الملف: ${caseNumber}`;

  try {
    await sendSystemNotification({
      title: actionText,
      message: messageText,
      type: 'info',
      relatedType: 'none',
      createdBy
    });
    // console.log(`Case ${action} notification sent to all employees`);
  } catch (error) {
    console.error('Error sending case notification:', error);
    // Don't throw error to avoid failing the case creation/update
  }
}

module.exports = {
  sendNotification,
  sendSystemNotification,
  sendTemplatedNotification,
  NotificationTemplates,
  sendMemoNotifications,
  sendCaseNotification
};

/**
 * Send notifications for memo creation/update to case employees and creator
 * @param {Object} params - Parameters
 * @param {Object} params.caseData - Case data with employee IDs
 * @param {number} params.createdBy - ID of the memo creator
 * @param {string} params.memoTitle - Title of the memo
 * @param {string} params.action - 'created' or 'updated'
 * @param {string} params.caseNumber - Case number for reference
 * @returns {Promise<void>}
 */
async function sendMemoNotifications({ caseData, createdBy, memoTitle, action = 'created', caseNumber }) {
  const employeeIds = [
    caseData.secretary_id,
    caseData.legal_advisor_id,
    caseData.lawyer_id,
    caseData.legal_researcher_id,
    createdBy
  ].filter(id => id != null); // Remove null/undefined values

  // Remove duplicates (in case the creator is also assigned to the case)
  const uniqueEmployeeIds = [...new Set(employeeIds)];

  const actionText = action === 'created' ? 'تم إنشاء مذكرة جديدة' : 'تم تحديث المذكرة';
  const messageText = action === 'created' 
    ? `تم إنشاء مذكرة جديدة "${memoTitle}" للملف ${caseNumber}`
    : `تم تحديث المذكرة "${memoTitle}" للملف ${caseNumber}`;

  // Send notification to each unique employee
  const notificationPromises = uniqueEmployeeIds.map(employeeId => 
    sendNotification({
      recipientId: employeeId,
      title: actionText,
      message: messageText,
      type: 'info',
      relatedType: 'memo',
      createdBy
    })
  );

  try {
    await Promise.all(notificationPromises);
    console.log(`Memo notifications sent to ${uniqueEmployeeIds.length} employees`);
  } catch (error) {
    console.error('Error sending memo notifications:', error);
    // Don't throw error to avoid failing the memo creation/update
  }
}