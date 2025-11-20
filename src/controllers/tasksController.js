const tasksService = require('../services/tasksService');
const { normalizePagination } = require('../utils/pagination');

const getAllTasks = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['due_date', 'created_at', 'id', 'priority']);
    const { status, priority, assigned_to, due_date } = req.query;
    const normalizedDueDate = due_date ? new Date(due_date).toISOString().split('T')[0] : undefined;

    const result = await tasksService.getAllTasks({
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      priority,
      assigned_to,
      due_date: normalizedDueDate
    });
    res.success(result.data, req.t('generic.ok'), 200, result.pagination);
  } catch (error) {
    res.fail('Failed to fetch tasks', 500, 'TASKS_LIST_ERROR');
  }
};

const createTask = async (req, res) => {
  try {
    const assignedBy = req.user ? req.user.id : null;
    const task = req.body;
    const taskId = await tasksService.createTask(task, assignedBy);
    res.status(201).json({ success: true, id: taskId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const success = await tasksService.updateTask(req.params.id, req.body, updatedBy);
    if (success) {
      res.json({ success: true, message: 'Task updated' });
    } else {
      res.status(404).json({ success: false, error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const success = await tasksService.deleteTask(req.params.id, deletedBy);
    if (success) {
      res.json({ message: 'Task deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await tasksService.getTaskById(req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ success: false, error: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch task' });
  }
};

const getTasksByEmployeeId = async (req, res) => {
  try {
    const tasks = await tasksService.getTasksByEmployeeId(req.params.employeeId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks for employee' });
  }
};

const getTasksByCaseId = async (req, res) => {
  try {
    const tasks = await tasksService.getTasksByCaseId(req.params.caseId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks for case' });
  }
};

const getAssignedToTasks = async (req, res) => {
  try {
    const tasks = await tasksService.getAssignedToTasks(req.params.employeeId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch assigned tasks' });
  }
};

const getCaseTasks = async (req, res) => {
  try {
    const tasks = await tasksService.getCaseTasks(req.params.caseId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch case tasks' });
  }
};

const getCreatorTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status } = req.query; // Get status from query parameters
    const tasks = await tasksService.getCreatorTasks(employeeId, status);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch creator tasks' });
  }
};

const deleteTaskDocument = async (req, res) => {
  try {
    const success = await tasksService.deleteTaskDocument(req.params.id);
    if (success) {
      res.json({ success: true, message: 'Task document deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Task document not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete task document' });
  }
};

const deleteTaskComment = async (req, res) => {
  try {
    const success = await tasksService.deleteTaskComment(req.params.id);
    if (success) {
      res.json({ success: true, message: 'Task comment deleted' });
    } else {
      res.status(404).json({ success: false, error: 'Task comment not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete task comment' });
  }
};

const addCommentToTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    const commentedBy = req.user ? req.user.id : null;
    
    if (!comment) {
      return res.status(400).json({ success: false, error: 'Comment is required' });
    }
    
    const commentId = await tasksService.addCommentToTask(taskId, comment, commentedBy);
    res.status(201).json({ success: true, id: commentId, message: 'Comment added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add comment to task' });
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
  addCommentToTask
};
