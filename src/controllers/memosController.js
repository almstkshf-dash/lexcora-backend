// memosController.js
// Controller functions for memos

const memosService = require('../services/memosService');
const { normalizePagination } = require('../utils/pagination');

const addMemo = async (req, res) => {
  try {
    const memoData = req.body;
    const userId = req.user ? req.user.id : null; // Assuming user info is in req.user
    const result = await memosService.addMemo(userId, memoData);

    res.status(201).json({
      success: true,
      message: 'Memo created successfully',
      memoId: result,
    });
  } catch (error) {
    console.error('Error creating memo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create memo',
      message: error.message 
    });
  }
};

const getAllMemos = async (req, res) => {
  try {
    const { page, limit, sortBy, sortOrder } = normalizePagination(req.query, ['created_at', 'submission_date', 'id']);
    const { status } = req.query;
    const result = await memosService.getAllMemos({ page, limit, sortBy, sortOrder, status });
    res.success(result.data, req.t('generic.ok'), 200, result.pagination);
  } catch (error) {
    console.error('Error fetching memos:', error);
    res.fail('Failed to fetch memos', 500, 'MEMOS_LIST_ERROR');
  }
};

const getMemoById = async (req, res) => {
  try {
    const memo = await memosService.getMemoById(req.params.id);
    if (memo) {
      res.json({ success: true, data: memo });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error fetching memo:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch memo' });
  }
};

const getMemosByCaseId = async (req, res) => {
  try {
    const memos = await memosService.getMemosByCaseId(req.params.caseId);
    res.json({ success: true, data: memos });
  } catch (error) {
    console.error('Error fetching memos by case:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch memos by case' });
  }
};

const updateMemo = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null; // Assuming user info is in req.user
    const success = await memosService.updateMemo(userId, req.params.id, req.body);
    if (success) {
      res.json({ success: true, message: 'Memo updated successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error updating memo:', error);
    res.status(500).json({ success: false, error: 'Failed to update memo' });
  }
};

const deleteMemo = async (req, res) => {
  try {
    const success = await memosService.deleteMemo(req.params.id);
    if (success) {
      res.json({ success: true, message: 'Memo deleted successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error deleting memo:', error);
    res.status(500).json({ success: false, error: 'Failed to delete memo' });
  }
};

const approveMemo = async (req, res) => {
  try {
    const { id } = req.params;
    let { position, approvedType } = req.body;
    
    // Valid approval types: lawyer, secretary, consultant, admin
    position = position.toLowerCase();
    const validApprovalPositions = ['lawyer', 'secretary', 'consultant', 'admin'];
    if (!validApprovalPositions.includes(position)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid approval position. Must be one of: lawyer, secretary, consultant, admin' 
      });
    }

    const success = await memosService.approveMemo(id, position, approvedType);
    
    if (success) {
      res.json({
        success: true,
        message: `Memo ${approvedType ? 'approvedType' : 'disapproved'} by ${position} successfully`
      });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error approving memo:', error);
    res.status(500).json({ success: false, error: 'Failed to approve memo' });
  }
};

const updateMemoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    
    // Valid status values
    const validStatuses = ['Draft', 'Pending Approval', 'Approved', 'Submitted to Court', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const success = await memosService.updateMemoStatus(id, status, adminNote);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Memo status updated successfully' 
      });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error updating memo status:', error);
    res.status(500).json({ success: false, error: 'Failed to update memo status' });
  }
};

const getMemosByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const memos = await memosService.getMemosByStatus(status);
    res.json({ success: true, data: memos });
  } catch (error) {
    console.error('Error fetching memos by status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch memos by status' });
  }
};

const getMemosPendingApproval = async (req, res) => {
  try {
    const memos = await memosService.getMemosPendingApproval();
    res.json({ success: true, data: memos });
  } catch (error) {
    console.error('Error fetching pending memos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending memos' });
  }
};

const submitMemoForApproval = async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await memosService.submitMemoForApproval(id);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Memo submitted for approval successfully' 
      });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error submitting memo for approval:', error);
    res.status(500).json({ success: false, error: 'Failed to submit memo for approval' });
  }
};

const getMemoApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const approvalStatus = await memosService.getMemoApprovalStatus(id);
    
    if (approvalStatus) {
      res.json({ success: true, data: approvalStatus });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error fetching memo approval status:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch memo approval status' });
  }
};

const getActiveEmployeeMemos = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const memos = await memosService.getActiveEmployeeMemos(employeeId);
    res.json({ success: true, data: memos });
  } catch (error) {
    console.error('Error fetching active employee memos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active employee memos' });
  }
};

const getActiveMemos = async (req, res) => {
  try {
    const memos = await memosService.getActiveMemos();
    res.json({ success: true, data: memos });
  } catch (error) {
    console.error('Error fetching active memos:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch active memos' });
  }
};

const updateEmployeeMemoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, position } = req.body;
    
    // Valid positions
    // const validPositions = ['lawyer', 'secretary', 'Legal Advisor', 'admin'];
    // if (!validPositions.includes(position?.toLowerCase())) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     error: `Invalid position. Must be one of: ${validPositions.join(', ')}` 
    //   });
    // }

    // Valid status values for employee memo status
    // const validStatuses = ['Pending', 'Approved', 'Rejected'];
    // if (!validStatuses.includes(status)) {
    //   return res.status(400).json({ 
    //     success: false, 
    //     error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    //   });
    // }
    
    const success = await memosService.updateEmployeeMemoStatus(id, status, position);
    
    if (success) {
      res.json({ 
        success: true, 
        message: `Memo status updated successfully for ${position}` 
      });
    } else {
      res.status(404).json({ success: false, error: 'Memo not found' });
    }
  } catch (error) {
    console.error('Error updating employee memo status:', error);
    res.status(500).json({ success: false, error: 'Failed to update employee memo status' });
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
