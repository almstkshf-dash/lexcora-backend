// memosService.js
// Service functions for memos

const memosModel = require('../models/memosModel');
const casesModel = require('../models/casesModel');
const { deleteDocumentFiles } = require('./storageService');
const { sendMemoNotifications } = require('../utils/notificationHelper');

const addMemo = async (userId,memoData) => {
  const files = memoData.files || [];

  try {
    if (!memoData.case_id || !memoData.title || !memoData.submission_date) {
      throw new Error('Missing required fields: case_id, title, and submission_date are required');
    }

    // First, create the memo to get the memoId
    const memoId = await memosModel.addMemo(userId, memoData);
    
    // Then, add documents using the correct memoId
    if (files.length > 0) {
      for (const file of files) {
        await memosModel.addMemoDocument(memoId, file.document_name, file.document_url, userId);
      }
    }
    
    // Get case data to send notifications to assigned employees
    try {
      const caseData = await casesModel.getCaseById(memoData.case_id);
      if (caseData) {
        await sendMemoNotifications({
          caseData,
          createdBy: userId,
          memoTitle: memoData.title,
          action: 'created',
          caseNumber: caseData.case_number || caseData.file_number || `Case #${memoData.case_id}`
        });
      }
    } catch (notificationError) {
      console.error('Error sending memo notifications:', notificationError);
      // Don't fail memo creation if notification fails
    }
    
    return memoId;
  } catch (error) {
    console.error('Error in addMemo service:', error);
    throw error;
  }
};

const getAllMemos = async (options) => {
  try {
    const { rows, total } = await memosModel.getAllMemos(options);
    return {
      data: rows,
      pagination: {
        total,
        page: options.page,
        limit: options.limit,
        totalPages: Math.ceil(total / options.limit)
      }
    };
  } catch (error) {
    console.error('Error in getAllMemos service:', error);
    throw error;
  }
};

const getMemoById = async (id) => {
  try {
    if (!id) {
      throw new Error('Memo ID is required');
    }
    const documents = await memosModel.getDocumentsByMemoId(id);
    const memo = await memosModel.getMemoById(id);
    return { ...memo, documents };
  } catch (error) {
    console.error('Error in getMemoById service:', error);
    throw error;
  }
};

const getMemosByCaseId = async (caseId) => {
  try {
    if (!caseId) {
      throw new Error('Case ID is required');
    }
    return await memosModel.getMemosByCaseId(caseId);
  } catch (error) {
    console.error('Error in getMemosByCaseId service:', error);
    throw error;
  }
};

const updateMemo = async (userId, id, memoData) => {
  const files = memoData.files || [];

  try {
    if (!id) {
      throw new Error('Memo ID is required');
    }
 

    // Check if memo exists
    // console.log(userId, id, memoData);
    const existingMemo = await memosModel.getMemoById(id);
    // console.log(existingMemo);
    if (!existingMemo) {
      throw new Error('Memo not found');
    }

    // Don't allow updating if memo is already approved or submitted
    // if (existingMemo.status === 'Approved' || existingMemo.status === 'Submitted to Court') {
    //   throw new Error('Cannot update memo that is already approved or submitted to court');
    // }
       if (files.length > 0) {
      for (const file of files) {
        await memosModel.addMemoDocument(id, file.document_name, file.document_url, userId);
      }
    }

    const result = await memosModel.updateMemo( id, memoData);
    
    // Get case data to send notifications to assigned employees
    try {
      const caseData = await casesModel.getCaseById(existingMemo.case_id);
      if (caseData) {
        await sendMemoNotifications({
          caseData,
          createdBy: userId,
          memoTitle: memoData.title || existingMemo.title,
          action: 'updated',
          caseNumber: caseData.case_number || caseData.file_number || `Case #${existingMemo.case_id}`
        });
      }
    } catch (notificationError) {
      console.error('Error sending memo update notifications:', notificationError);
      // Don't fail memo update if notification fails
    }
    
    return result;
  } catch (error) {
    console.error('Error in updateMemo service:', error);
    throw error;
  }
};

const deleteMemo = async (id) => {
  try {
    if (!id) {
      throw new Error('Memo ID is required');
    }

    // Check if memo exists
    const existingMemo = await memosModel.getMemoById(id);
    if (!existingMemo) {
      throw new Error('Memo not found');
    }

    // Don't allow deleting if memo is submitted to court
    if (existingMemo.status === 'Submitted to Court') {
      throw new Error('Cannot delete memo that has been submitted to court');
    }

    // Get memo documents before deleting
    const documents = await memosModel.getDocumentsByMemoId(id);

    // Delete from database (CASCADE will delete document records)
    const result = await memosModel.deleteMemo(id);

    // Delete files from AWS S3
    if (documents && documents.length > 0) {
      await deleteDocumentFiles(documents);
    }

    return result;
  } catch (error) {
    console.error('Error in deleteMemo service:', error);
    throw error;
  }
};

const approveMemo = async (id, position, approvedType) => {

  try {
    if (!id || !approvedType) {
      throw new Error('Memo ID and approved type are required');
    }

    // Check if memo exists
    const existingMemo = await memosModel.getMemoById(id);

    if (!existingMemo) {
      throw new Error('Memo not found');
    }

    // Don't allow approval changes if memo is already submitted to court
    // if (existingMemo.status === 'Submitted to Court') {
    //   throw new Error('Cannot change approval status of memo that has been submitted to court');
    // }

    const success = await memosModel.updateMemoApproval(id, position, approvedType);
    // Check if all approvals are complete after this update
    if (success && approvedType) {
      const allApprovalsComplete = await memosModel.checkAllApprovalsComplete(id);
      if (allApprovalsComplete) {
        // Auto-update status to 'Approved' when all approvals are complete
        await memosModel.updateMemoStatus(id, 'Approved');
      }
    }

    
    // If any approval is removed, set status back to 'Pending Approval'
    if (success && !isApproved && existingMemo.status === 'Approved') {
      await memosModel.updateMemoStatus(id, 'Pending Approval');
    }

    return success;
  } catch (error) {
    console.error('Error in approveMemo service:', error);
    throw error;
  }
};

const updateMemoStatus = async (id, status, adminNote = null) => {
  try {
    if (!id || !status) {
      throw new Error('Memo ID and status are required');
    }

    // Check if memo exists
    const existingMemo = await memosModel.getMemoById(id);
    if (!existingMemo) {
      throw new Error('Memo not found');
    }

    // Validate status transitions
    const validTransitions = {
      'Draft': ['Pending Approval', 'Rejected'],
      'Pending Approval': ['Approved', 'Rejected', 'Draft'],
      'Approved': ['Submitted to Court', 'Rejected'],
      'Submitted to Court': [], // Final state
      'Rejected': ['Draft', 'Pending Approval']
    };

    const allowedTransitions = validTransitions[existingMemo.status] || [];
    if (!allowedTransitions.includes(status)) {
      throw new Error(`Invalid status transition from '${existingMemo.status}' to '${status}'`);
    }

    // If setting to 'Approved', check if all approvals are complete
    if (status === 'Approved') {
      const allApprovalsComplete = await memosModel.checkAllApprovalsComplete(id);
      if (!allApprovalsComplete) {
        throw new Error('Cannot set status to Approved - not all required approvals are complete');
      }
    }

    return await memosModel.updateMemoStatus(id, status, adminNote);
  } catch (error) {
    console.error('Error in updateMemoStatus service:', error);
    throw error;
  }
};

const updateEmployeeMemoStatus = async (id, status, position) => {
  try {
    if (!id || !status || !position) {
      throw new Error('Memo ID, status, and position are required');
    }

    return await memosModel.updateEmployeeMemoStatus(id, status, position);
  } catch (error) {
    console.error('Error in updateEmployeeMemoStatus service:', error);
    throw error;
  }
};

const getMemosByStatus = async (status) => {
  try {
    if (!status) {
      throw new Error('Status is required');
    }
    return await memosModel.getMemosByStatus(status);
  } catch (error) {
    console.error('Error in getMemosByStatus service:', error);
    throw error;
  }
};

const getMemosPendingApproval = async () => {
  try {
    return await memosModel.getMemosPendingApproval();
  } catch (error) {
    console.error('Error in getMemosPendingApproval service:', error);
    throw error;
  }
};

const submitMemoForApproval = async (id) => {
  try {
    if (!id) {
      throw new Error('Memo ID is required');
    }

    // Check if memo exists
    const existingMemo = await memosModel.getMemoById(id);
    if (!existingMemo) {
      throw new Error('Memo not found');
    }

    // Only allow submission from Draft status
    if (existingMemo.status !== 'Draft') {
      throw new Error('Only memos in Draft status can be submitted for approval');
    }

    // Validate that required fields are complete
    if (!existingMemo.title || !existingMemo.submission_date) {
      throw new Error('Memo must have title and submission date before submitting for approval');
    }

    return await memosModel.updateMemoStatus(id, 'Pending Approval');
  } catch (error) {
    console.error('Error in submitMemoForApproval service:', error);
    throw error;
  }
};

const getMemoApprovalStatus = async (id) => {
  try {
    if (!id) {
      throw new Error('Memo ID is required');
    }

    const memo = await memosModel.getMemoById(id);
    if (!memo) {
      throw new Error('Memo not found');
    }

    return {
      id: memo.id,
      status: memo.status,
      approvals: {
        lawyer: memo.is_lawyer_approved === 1,
        secretary: memo.is_secretary_approved === 1,
        consultant: memo.is_consultant_approved === 1,
        admin: memo.is_admin_approved === 1
      },
      allApprovalsComplete: await memosModel.checkAllApprovalsComplete(id),
      adminNote: memo.admin_note
    };
  } catch (error) {
    console.error('Error in getMemoApprovalStatus service:', error);
    throw error;
  }
};

const getActiveEmployeeMemos = async (employeeId) => {
  try {
    if (!employeeId) {
      throw new Error('Employee ID is required');
    }
    return await memosModel.getActiveEmployeeMemos(employeeId);
  } catch (error) {
    console.error('Error in getActiveEmployeeMemos service:', error);
    throw error;
  }
};

const getActiveMemos = async () => {
  try {
    return await memosModel.getActiveMemos();
  } catch (error) {
    console.error('Error in getActiveMemos service:', error);
    throw error;
  }
};

module.exports = {
  addMemo,
  getAllMemos,
  getMemoById,
  getMemosByCaseId,
  updateMemo,
  deleteMemo,
  approveMemo,
  updateMemoStatus,
  updateEmployeeMemoStatus,
  getMemosByStatus,
  getMemosPendingApproval,
  submitMemoForApproval,
  getMemoApprovalStatus,
  getActiveEmployeeMemos,
  getActiveMemos
};
