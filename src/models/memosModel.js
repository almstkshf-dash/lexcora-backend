const app = require("../app");
const db = require("../config/db");

const addMemo = async (userId,  memoData) => {
  try {
    const {
      case_id,
      title,
      submission_date,
      description,
      is_lawyer_approved = 0,
      is_secretary_approved = 0,
      is_consultant_approved = 0,
      is_admin_approved = 0,
      status = 'Draft',
      admin_note = null,
      created_by = userId
    } = memoData;

    const [result] = await db.query(
      `
      INSERT INTO memos (
        case_id, title, submission_date, description, 
        is_lawyer_approved, is_secretary_approved, is_consultant_approved, 
        is_admin_approved, status, admin_note, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        case_id,
        title,
        submission_date,
        description,
        is_lawyer_approved,
        is_secretary_approved,
        is_consultant_approved,
        is_admin_approved,
        status,
        admin_note,
        created_by
      ]
    );

    return result.insertId;
  } catch (error) {
    console.error('Error in addMemo:', error);
    throw error;
  }
};

const getAllMemos = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.*,
        c.case_number,
        c.file_number,
        c.topic as case_topic
      FROM memos m
      LEFT JOIN cases c ON m.case_id = c.id
      ORDER BY m.created_at DESC LIMIT 30
    `);
    return rows;
  } catch (error) {
    console.error('Error in getAllMemos:', error);
    throw error;
  }
};

const getMemoById = async (id) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.*,
        c.case_number,
        c.file_number,
        c.topic as case_topic
      FROM memos m
      LEFT JOIN cases c ON m.case_id = c.id
      WHERE m.id = ?
    `, [id]);
    // console.log(rows);
    return rows[0];

  } catch (error) {
    console.error('Error in getMemoById:', error);
    throw error;
  }
};

const getMemosByCaseId = async (caseId) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, e.name AS created_by_name FROM memos m
      LEFT JOIN employees e ON m.created_by = e.id
      WHERE case_id = ? 
      ORDER BY created_at DESC
    `, [caseId]);
    return rows;
  } catch (error) {
    console.error('Error in getMemosByCaseId:', error);
    throw error;
  }
};

const updateMemo = async (id, memoData) => {
  try {
    const {
      title,
      submission_date,
      description,
      status,
      admin_note
    } = memoData;

    const [result] = await db.query(`
      UPDATE memos 
      SET title = ?, submission_date = ?, description = ?, status = ?, admin_note = ?
      WHERE id = ?
    `, [title, submission_date, description, status, admin_note, id]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateMemo:', error);
    throw error;
  }
};

const updateMemoApproval = async (id, position, approvalType, isApproved) => {
    approvalType = approvalType.toLowerCase();
    console.log('approvalType:', approvalType);

  try {
    const approvalField = `is_${approvalType}_approved`;
    console.log(approvalField);
    const [result] = await db.query(`
      UPDATE memos 
      SET ${approvalField} = ? 
      WHERE id = ?
    `, [isApproved, id]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateMemoApproval:', error);
    throw error;
  }
};

const updateMemoStatus = async (id, status, adminNote = null) => {
  try {
    const [result] = await db.query(`
      UPDATE memos 
      SET status = ?, admin_note = ?
      WHERE id = ?
    `, [status, adminNote, id]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateMemoStatus:', error);
    throw error;
  }
};

const deleteMemo = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM memos WHERE id = ?', [id]);
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in deleteMemo:', error);
    throw error;
  }
};

const getMemosByStatus = async (status) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.*,
        c.case_number,
        c.file_number,
        c.topic as case_topic
      FROM memos m
      LEFT JOIN cases c ON m.case_id = c.id
      WHERE m.status = ?
      ORDER BY m.created_at DESC
    `, [status]);
    return rows;
  } catch (error) {
    console.error('Error in getMemosByStatus:', error);
    throw error;
  }
};

const getMemosPendingApproval = async () => {
  try {
    const [rows] = await db.query(`
      SELECT 
        m.*,
        c.case_number,
        c.file_number,
        c.topic as case_topic
      FROM memos m
      LEFT JOIN cases c ON m.case_id = c.id
      WHERE m.status = 'Pending Approval'
      ORDER BY m.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error in getMemosPendingApproval:', error);
    throw error;
  }
};

const checkAllApprovalsComplete = async (id) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        is_lawyer_approved,
        is_secretary_approved,
        is_consultant_approved,
        is_admin_approved
      FROM memos 
      WHERE id = ?
    `, [id]);
    
    if (rows.length === 0) return false;
    
    const memo = rows[0];
    return memo.is_lawyer_approved && 
           memo.is_secretary_approved && 
           memo.is_consultant_approved && 
           memo.is_admin_approved;
  } catch (error) {
    console.error('Error in checkAllApprovalsComplete:', error);
    throw error;
  }
};

const addMemoDocument = async (memoId, documentName, documentUrl, uploadedBy) => {
  try {
    const [result] = await db.query(`
      INSERT INTO memo_documents (memo_id, document_name, document_url, uploaded_by)
      VALUES (?, ?, ?, ?)
    `, [memoId, documentName, documentUrl, uploadedBy]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in addMemoDocument:', error);
    throw error;
  }
};

const getActiveEmployeeMemos = async (employeeId) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*,  e.name AS created_by_name 
      FROM memos m
      LEFT JOIN employees e ON m.created_by = e.id
      INNER JOIN cases c ON m.case_id = c.id
      WHERE (m.created_by = ? OR c.lawyer_id = ? OR c.secretary_id = ? OR c.legal_advisor_id = ?) 
        AND m.status != 'Approved' AND m.status != 'Rejected'
      ORDER BY m.created_at DESC
    `, [employeeId, employeeId, employeeId, employeeId]);
    return rows;
  } catch (error) {
    console.error('Error in getActiveEmployeeMemos:', error);
    throw error;
  }
};
const getActiveMemos = async () => {
  try {
    const [rows] = await db.query(`
      SELECT m.*,  e.name AS created_by_name 
      FROM memos m
      LEFT JOIN employees e ON m.created_by = e.id
      INNER JOIN cases c ON m.case_id = c.id
      WHERE m.status != 'Approved' AND m.status != 'Rejected'
      ORDER BY m.created_at DESC
    `);
    return rows;
  } catch (error) {
    console.error('Error in getActiveMemos:', error);
    throw error;
  }
};


const getEmployeeMemos = async (employeeId) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*, e.name AS created_by_name 
      FROM memos m
      LEFT JOIN employees e ON m.created_by = e.id
      WHERE m.created_by = ?
    `, [employeeId]);
    return rows;
  } catch (error) {
    console.error('Error in getEmployeeMemos:', error);
    throw error;
  }
};

const getDocumentsByMemoId = async (memoId) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM memo_documents
      WHERE memo_id = ?
    `, [memoId]);
    return rows;
  } catch (error) {
    console.error('Error in getDocumentsByMemoId:', error);
    throw error;
  }
};

const updateEmployeeMemoStatus = async (id, status, position) => {
  try {
    // Normalize position to lowercase
    position = position.toLowerCase();
    console
    // Map position to corresponding status field
    const statusFieldMap = {
      'admin': 'admin_status',
      'secretary': 'secretary_status',
      'legal advisor': 'consultant_status',
      'lawyer': 'lawyer_status'
    };
    

    
    const statusField = statusFieldMap[position];
    console.log('statusField:', statusField);
    if (!statusField) {
      throw new Error(`Invalid position: ${position}`);
    }
    
    const [result] = await db.query(`
      UPDATE memos 
      SET ${statusField} = ?
      WHERE id = ?
    `, [status, id]);

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in updateEmployeeMemoStatus:', error);
    throw error;
  }
};

module.exports = {
  addMemo,
  getAllMemos,
  getMemoById,
  getMemosByCaseId,
  updateMemo,
  updateMemoApproval,
  updateMemoStatus,
  deleteMemo,
  getMemosByStatus,
  getMemosPendingApproval,
  checkAllApprovalsComplete,
  addMemoDocument,
  getActiveEmployeeMemos,
  getEmployeeMemos,
  getActiveMemos,
  getDocumentsByMemoId,
  updateEmployeeMemoStatus
};