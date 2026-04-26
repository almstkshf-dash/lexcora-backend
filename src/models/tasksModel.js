const db = require("../config/db");

const getAllTasks = async ({ 
  page = 1, 
  limit = 10, 
  sortBy = 'created_at', 
  sortOrder = 'DESC', 
  status, 
  priority, 
  assigned_to, 
  assigned_by, 
  case_id,
  due_date,
  search 
}) => {
  const offset = (page - 1) * limit;
  const allowedSort = ['due_date', 'created_at', 'id', 'priority', 'status'];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : 'created_at';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];

  if (status) {
    if (status === 'active') {
      conditions.push("t.status != 'completed' AND t.status != 'cancelled'");
    } else {
      conditions.push('t.status = ?');
      params.push(status);
    }
  }
  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }
  if (assigned_to) {
    conditions.push('t.assigned_to = ?');
    params.push(assigned_to);
  }
  if (assigned_by) {
    conditions.push('t.assigned_by = ?');
    params.push(assigned_by);
  }
  if (case_id) {
    conditions.push('t.case_id = ?');
    params.push(case_id);
  }
  if (due_date) {
    conditions.push('DATE(t.due_date) = ?');
    params.push(due_date);
  }
  if (search) {
    conditions.push('(t.title LIKE ? OR t.description LIKE ? OR c.case_number LIKE ?)');
    const searchVal = `%${search}%`;
    params.push(searchVal, searchVal, searchVal);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await db.query(`
    SELECT COUNT(DISTINCT t.id) as total 
    FROM tasks t 
    LEFT JOIN cases c ON t.case_id = c.id
    ${whereClause}
  `, params);
  const total = countRows[0]?.total || 0;

  const [rows] = await db.query(
    `SELECT t.*, 
            c.case_number, c.file_number, c.topic as case_topic,
            assignee.name as assigned_to_name,
            creator.name as assigned_by_name,
            creator.name as created_by
     FROM tasks t 
     LEFT JOIN cases c ON t.case_id = c.id
     LEFT JOIN employees assignee ON t.assigned_to = assignee.id
     LEFT JOIN employees creator ON t.assigned_by = creator.id
     ${whereClause} 
     ORDER BY t.${orderBy} ${orderDir} 
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
};

const getAssignedToTasks = async (employeeId, options = {}) => {
  return await getAllTasks({ 
    ...options, 
    assigned_to: employeeId
  });
};

const createTask = async (assignedBy, task) => {
  const { title, description, priority, assigned_to, due_date, case_id } = task;
  const [result] = await db.query(`
    INSERT INTO tasks (title, description, priority, assigned_to, due_date, case_id, assigned_by) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [title, description, priority, assigned_to, due_date, case_id, assignedBy]);
  return result.insertId;
};

const addTaskDocument = async (taskId, fileName, url) => {
  const [result] = await db.query(`
    INSERT INTO task_documents (task_id, document_name, document_url) VALUES (?, ?, ?)
  `, [taskId, fileName, url]);
  return result.insertId;
}
const addCommentToTask = async (taskId, comment, commentedBy) => {
  const [result] = await db.query(`
    INSERT INTO task_comments (task_id, comment, commented_by) VALUES (?, ?, ?)
  `, [taskId, comment, commentedBy]);
  return result.insertId;
};

const deleteTaskDocument = async (id) => {
  const [result] = await db.query("DELETE FROM task_documents WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
const getTaskDocuments = async (taskId) => {
  const [rows] = await db.query("SELECT td.id, td.document_name, td.document_url, e.name AS uploaded_by_name FROM task_documents td LEFT JOIN employees e ON td.uploaded_by = e.id WHERE td.task_id = ?", [taskId]);
  return rows;
};

const getTaskComments = async (taskId) => {
  const [rows] = await db.query("SELECT tc.id, tc.comment, tc.created_at, e.name AS commented_by_name FROM task_comments tc JOIN employees e ON tc.commented_by = e.id WHERE tc.task_id = ?", [taskId]);
  return rows;
}

const deleteTaskComment = async (id) => {
  const [result] = await db.query("DELETE FROM task_comments WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getCaseTasks = async (caseId) => {
  const [rows] = await db.query(`
    SELECT t.*, 
           creator.name AS created_by,
           assignee.name AS assigned_to_name
    FROM tasks t 
    JOIN employees creator ON t.assigned_by = creator.id 
    LEFT JOIN employees assignee ON t.assigned_to = assignee.id 
    WHERE t.case_id = ?
  `, [caseId]);
  return rows;
};
const getCreatorTasks = async (employeeId, options = {}) => {
  return await getAllTasks({ 
    ...options, 
    assigned_by: employeeId 
  });
};

const updateTask = async (id, task) => {
  const { title, description, priority, status, assigned_to, due_date, case_id } = task;
  try {
    const [result] = await db.query(` 
      UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, assigned_to = ?, due_date = ?, case_id = ? WHERE id = ?
    `, [title, description, priority, status, assigned_to, due_date, case_id, id]);

  return result.affectedRows > 0;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};  



const deleteTask = async (id) => {
  const [result] = await db.query("DELETE FROM tasks WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

const getTaskDocumentById = async (id) => {
  const [rows] = await db.query("SELECT * FROM task_documents WHERE id = ?", [id]);
  return rows[0];
};

const getTaskById = async (id) => {
  const [rows] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
  if (!rows[0]) {
    return null;
  }
  return rows[0];
  // return { ...rows[0], comments: comments || [] , documents: documents || [] };
};

const getTasksByEmployeeId = async (employeeId) => {
  const [rows] = await db.query("SELECT * FROM tasks WHERE assigned_by = ?", [employeeId]);
  return rows;
};

const getTasksByCaseId = async (caseId) => {
  const [rows] = await db.query("SELECT * FROM tasks WHERE case_id = ?", [caseId]);
  return rows;
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  getTasksByEmployeeId,
  addTaskDocument,
  getTasksByCaseId,
  getCaseTasks,
  getAssignedToTasks,
  getCreatorTasks,
  deleteTaskComment,
  deleteTaskDocument,
  addCommentToTask,
  getTaskDocuments,
  getTaskComments,
  getTaskDocumentById
};
