const callLogsModel = require('../models/callLogsModel');

/**
 * Get all call logs with pagination and filters
 */
const getAllCallLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const callType = req.query.callType || '';

    const callLogs = await callLogsModel.getAllCallLogs(page, limit, search, callType);
    const totalCount = await callLogsModel.getCallLogsCount(search, callType);
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: callLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجلات المكالمات',
      error: error.message
    });
  }
};

/**
 * Get call log by ID
 */
const getCallLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف المكالمة مطلوب'
      });
    }

    const callLog = await callLogsModel.getCallLogById(id);

    if (!callLog) {
      return res.status(404).json({
        success: false,
        message: 'المكالمة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      data: callLog
    });
  } catch (error) {
    console.error('Error fetching call log:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المكالمة',
      error: error.message
    });
  }
};

/**
 * Create new call log
 */
const createCallLog = async (req, res) => {
  try {
    const {
      caller_name,
      phone_number,
      call_type,
      call_date,
      call_time,
      topic,
      details,
      duration_minutes,
      file_case_number
    } = req.body;

    // Validation
    if (!caller_name || !phone_number || !call_type || !call_date) {
      return res.status(400).json({
        success: false,
        message: 'اسم المتصل ورقم الهاتف ونوع المكالمة والتاريخ مطلوبة'
      });
    }

    const created_by = req.user?.id || null;

    const callLogId = await callLogsModel.createCallLog({
      caller_name,
      phone_number,
      call_type,
      call_date,
      call_time,
      topic,
      details,
      duration_minutes,
      file_case_number,
      created_by
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة المكالمة بنجاح',
      data: { id: callLogId }
    });
  } catch (error) {
    console.error('Error creating call log:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة المكالمة',
      error: error.message
    });
  }
};

/**
 * Update call log
 */
const updateCallLog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      caller_name,
      phone_number,
      call_type,
      call_date,
      call_time,
      topic,
      details,
      duration_minutes,
      file_case_number
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف المكالمة مطلوب'
      });
    }

    const result = await callLogsModel.updateCallLog(id, {
      caller_name,
      phone_number,
      call_type,
      call_date,
      call_time,
      topic,
      details,
      duration_minutes,
      file_case_number
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'المكالمة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث المكالمة بنجاح'
    });
  } catch (error) {
    console.error('Error updating call log:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المكالمة',
      error: error.message
    });
  }
};

/**
 * Delete call log
 */
const deleteCallLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف المكالمة مطلوب'
      });
    }

    const result = await callLogsModel.deleteCallLog(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'المكالمة غير موجودة'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف المكالمة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting call log:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المكالمة',
      error: error.message
    });
  }
};

module.exports = {
  getAllCallLogs,
  getCallLogById,
  createCallLog,
  updateCallLog,
  deleteCallLog
};
