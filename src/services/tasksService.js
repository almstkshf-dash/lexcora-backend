// tasksService.js
// Service functions for tasks

const tasksModel = require('../models/tasksModel');
const { deleteDocumentFiles } = require('./storageService');
const { sendNotification, sendTemplatedNotification } = require('../utils/notificationHelper');
const { logAdd, logUpdate, logDelete } = require('./logsService');

const getAllTasks = async (options) => {
  const { rows, total } = await tasksModel.getAllTasks(options);
  return {
    data: rows,
    pagination: {
      total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(total / options.limit)
    }
  };
};

const createTask = async (task, assignedBy) => {
  try {
    const taskId = await tasksModel.createTask(assignedBy, task);
    const files = task.files || [];
    for (const file of files) {
      await tasksModel.addTaskDocument(taskId, file.document_name, file.document_url);
    }
    
    // Log the task creation
    if (assignedBy) {
      await logAdd(assignedBy, 'مهمة', task.title || 'مهمة جديدة', taskId);
    }
    
    // Send notification to assigned employee
    if (task.assigned_to && task.assigned_to !== assignedBy) {
      try {
        await sendNotification({
          recipientId: task.assigned_to,
          title: "New Task Assigned",
          message: `You have been assigned a new task: "${task.title}"`,
          type: "info",
          relatedType: "task",
          createdBy: assignedBy
        });
      } catch (notifyError) {
        console.error('Error sending task assignment notification:', notifyError);
        // Don't throw - task creation should succeed even if notification fails
      }
    }
    
    return taskId;
  } catch (error) {
    console.error('Error in createTask:', error);
    throw new Error('Error creating task');
  }
};

const updateTask = async (id, task, updatedBy) => {
  try {
    // Get current task data to compare changes
    const currentTask = await tasksModel.getTaskById(id);
    
    const files = task.files || [];
    for (const file of files) {
      await tasksModel.addTaskDocument(id, file.document_name, file.document_url);
    }
    
    const result = await tasksModel.updateTask(id, task);
    
    // Log the task update
    if (updatedBy && currentTask) {
      await logUpdate(updatedBy, 'مهمة', currentTask.title || 'مهمة', id);
    }
    
    // Send notifications for important changes
    if (currentTask) {
      // Always notify the task creator when task is updated (unless they are the one updating it)
      if (currentTask.assigned_by && currentTask.assigned_by !== updatedBy) {
        try {
          await sendNotification({
            recipientId: currentTask.assigned_by,
            title: "Task Updated",
            message: `Task "${currentTask.title}" has been updated`,
            type: "info",
            relatedType: "task",
            createdBy: updatedBy
          });
        } catch (notifyError) {
          console.error('Error sending task update notification:', notifyError);
        }
      }
      
      // Notify if task status changed to completed
      if (currentTask.status !== 'completed' && task.status === 'completed') {
        try {
          // Notify the task creator
          if (currentTask.assigned_by && currentTask.assigned_by !== updatedBy) {
            await sendNotification({
              recipientId: currentTask.assigned_by,
              title: "Task Completed",
              message: `Task "${currentTask.title}" has been completed`,
              type: "success",
              relatedType: "task",
              createdBy: updatedBy
            });
          }
        } catch (notifyError) {
          console.error('Error sending task completion notification:', notifyError);
        }
      }
      
      // Notify if assigned to different person
      if (currentTask.assigned_to !== task.assigned_to && task.assigned_to) {
        try {
          await sendNotification({
            recipientId: task.assigned_to,
            title: "Task Reassigned",
            message: `You have been assigned to task: "${currentTask.title}"`,
            type: "info",
            relatedType: "task",
            createdBy: updatedBy
          });
        } catch (notifyError) {
          console.error('Error sending task reassignment notification:', notifyError);
        }
      }
      
      // Notify if priority changed to high
      if (currentTask.priority !== 'high' && task.priority === 'high') {
        try {
          await sendNotification({
            recipientId: task.assigned_to || currentTask.assigned_to,
            title: "High Priority Task",
            message: `Task "${currentTask.title}" has been marked as high priority`,
            type: "warning",
            relatedType: "task",
            createdBy: updatedBy
          });
        } catch (notifyError) {
          console.error('Error sending priority change notification:', notifyError);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in updateTask:', error);
    throw error;
  }
};

const deleteTask = async (id, deletedBy = null) => {
  // Get task details before deletion for logging
  const task = await tasksModel.getTaskById(id);
  
  const documents = await tasksModel.getTaskDocuments(id);
  if (documents && documents.length > 0) {
    await deleteDocumentFiles(documents);
  }
  
  const result = await tasksModel.deleteTask(id);
  
  // Log the task deletion
  if (deletedBy && task) {
    await logDelete(deletedBy, 'مهمة', task.title || 'مهمة', id);
  }
  
  return result;
};

const getTaskById = async (id) => {
  const documents = await tasksModel.getTaskDocuments(id);
  const comments = await tasksModel.getTaskComments(id);
  const task = await tasksModel.getTaskById(id);
  return {
    ...task,
    documents,
    comments
  };
};

const getTasksByEmployeeId = async (employeeId) => {
  return await tasksModel.getTasksByEmployeeId(employeeId);
};

const getTasksByCaseId = async (caseId) => {
  return await tasksModel.getTasksByCaseId(caseId);
};

const getAssignedToTasks = async (employeeId, options = {}) => {
  const { rows, total } = await tasksModel.getAssignedToTasks(employeeId, options);
  return {
    data: rows,
    pagination: {
      total,
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: Math.ceil(total / (options.limit || 10))
    }
  };
};

const getCaseTasks = async (caseId) => {
  return await tasksModel.getCaseTasks(caseId);
};

const getCreatorTasks = async (employeeId, options = {}) => {
  const { rows, total } = await tasksModel.getCreatorTasks(employeeId, options);
  return {
    data: rows,
    pagination: {
      total,
      page: options.page || 1,
      limit: options.limit || 10,
      totalPages: Math.ceil(total / (options.limit || 10))
    }
  };
};

const deleteTaskDocument = async (id) => {
  const existingDocument = await tasksModel.getTaskDocumentById(id);
  if (existingDocument) {
    await deleteDocumentFiles([existingDocument]);
  }
  return await tasksModel.deleteTaskDocument(id);
};

const deleteTaskComment = async (id) => {
  return await tasksModel.deleteTaskComment(id);
};

const addCommentToTask = async (taskId, comment, commentedBy) => {
  try {
    const result = await tasksModel.addCommentToTask(taskId, comment, commentedBy);
    
    // Get task details to notify relevant people
    const task = await tasksModel.getTaskById(taskId);
    
    if (task) {
      // Notify assigned employee (if not the commenter)
      if (task.assigned_to && task.assigned_to !== commentedBy) {
        try {
          await sendNotification({
            recipientId: task.assigned_to,
            title: "New Comment on Task",
            message: `New comment added to task: "${task.title}"`,
            type: "info",
            relatedType: "task",
            createdBy: commentedBy
          });
        } catch (notifyError) {
          console.error('Error sending comment notification:', notifyError);
        }
      }
      
      // Notify task creator (if not the commenter and different from assigned_to)
      if (task.assigned_by && 
          task.assigned_by !== commentedBy && 
          task.assigned_by !== task.assigned_to) {
        try {
          await sendNotification({
            recipientId: task.assigned_by,
            title: "New Comment on Task",
            message: `New comment added to task: "${task.title}"`,
            type: "info",
            relatedType: "task",
            createdBy: commentedBy
          });
        } catch (notifyError) {
          console.error('Error sending comment notification to creator:', notifyError);
        }
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in addCommentToTask:', error);
    throw error;
  }
};

// Check for overdue tasks and send notifications
const checkOverdueTasks = async () => {
  try {
    const overdueTasks = await tasksModel.getOverdueTasks();
    
    for (const task of overdueTasks) {
      if (task.assigned_to) {
        try {
          await sendNotification({
            recipientId: task.assigned_to,
            title: "Task Overdue",
            message: `Task "${task.title}" is overdue. Due date was ${new Date(task.due_date).toLocaleDateString()}`,
            type: "warning",
            relatedType: "task",
            createdBy: null // System generated
          });
        } catch (notifyError) {
          console.error('Error sending overdue notification:', notifyError);
        }
      }
    }
    
    return overdueTasks.length;
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
    throw error;
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasksByEmployeeId,
  getTasksByCaseId,
  getAssignedToTasks,
  getCaseTasks,
  getCreatorTasks,
  deleteTaskDocument,
  deleteTaskComment,
  addCommentToTask,
  checkOverdueTasks
};
