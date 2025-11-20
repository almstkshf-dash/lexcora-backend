const db = require("../config/db");

const getAllTasks = async ({ page, limit, sortBy, sortOrder, status, priority, assigned_to, due_date }) => {
  const offset = (page - 1) * limit;
  const allowedSort = ['due_date', 'created_at', 'id', 'priority'];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : 'created_at';
  const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('t.status = ?');
    params.push(status);
  }
  if (priority) {
    conditions.push('t.priority = ?');
    params.push(priority);
  }
  if (assigned_to) {
    conditions.push('t.assigned_to = ?');
    params.push(assigned_to);
  }
  if (due_date) {
    conditions.push('DATE(t.due_date) = ?');
    params.push(due_date);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await db.query(`SELECT COUNT(*) as total FROM tasks t ${whereClause}`, params);
  const total = countRows[0]?.total || 0;

  const [rows] = await db.query(
    `SELECT t.* FROM tasks t ${whereClause} ORDER BY t.${orderBy} ${orderDir} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  return { rows, total };
};

 const getAssignedToTasks = async (employeeId) => {
   const [rows] = await db.query("SELECT t.*, e.name AS created_by, e.name AS assigned_by_name FROM tasks t JOIN employees e ON t.assigned_by = e.id WHERE t.assigned_to = ? AND t.status != 'completed'", [employeeId]);
   return rows;
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
const getCreatorTasks = async (employeeId,status) => {
  try {
  const [rows] = await db.query("SELECT t.*, e.name AS assigned_to_name, e2.name AS assigned_by_name FROM tasks t JOIN employees e ON t.assigned_to = e.id LEFT JOIN employees e2 ON t.assigned_by = e2.id WHERE t.assigned_by = ? AND t.status = ? LIMIT 10", [employeeId,status]);
  
  return rows;
  } catch (error) {
    console.error('Error fetching creator tasks:', error);
    throw error;
  }
}

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
