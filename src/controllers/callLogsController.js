const callLogsModel = require('../models/callLogsModel');
const { sendSystemNotification } = require('../utils/notificationHelper');

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

    res.list(callLogs || [], req.t('generic.ok'), {
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1
    });
  } catch (error) {
    console.error('[GET_ALL_CALL_LOGS_ERROR]', { message: error.message, stack: error.stack, query: req.query });
    res.fail(req.t('call.failedFetch'), 500, 'CALL_LOGS_LIST_ERROR');
  }
};

/**
 * Get call log by ID
 */
const getCallLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.fail(req.t('generic.validationError'), 400, 'ID_REQUIRED');
    }

    const callLog = await callLogsModel.getCallLogById(id);

    if (!callLog) {
      return res.fail(req.t('generic.notFound'), 404, 'CALL_LOG_NOT_FOUND');
    }

    res.success(callLog);
  } catch (error) {
    console.error('[GET_CALL_LOG_BY_ID_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('call.failedFetch'), 500, 'CALL_LOG_FETCH_ERROR');
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
      return res.fail(req.t('generic.validationError'), 400, 'MISSING_FIELDS');
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

    // Send notification to all admins
    try {
      const callTypeText = call_type === 'incoming' ? 'واردة' : 'صادرة';
      const topicText = topic ? ` - ${topic}` : '';
      await sendSystemNotification({
        title: 'مكالمة جديدة',
        message: `تم إضافة مكالمة ${callTypeText} من ${caller_name}${topicText}`,
        type: 'info',
        relatedType: 'none',
        createdBy: created_by
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.created({ id: callLogId }, req.t('call.created'));
  } catch (error) {
    console.error('[CREATE_CALL_LOG_ERROR]', { message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('call.failedCreate'), 500, 'CALL_LOG_CREATE_ERROR');
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
      return res.fail(req.t('generic.validationError'), 400, 'ID_REQUIRED');
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
      return res.fail(req.t('generic.notFound'), 404, 'CALL_LOG_NOT_FOUND');
    }

    // Send notification to all admins
    try {
      const callTypeText = call_type === 'incoming' ? 'واردة' : 'صادرة';
      const topicText = topic ? ` - ${topic}` : '';
      const updatedBy = req.user?.id || null;
      await sendSystemNotification({
        title: 'تحديث مكالمة',
        message: `تم تحديث مكالمة ${callTypeText} من ${caller_name}${topicText}`,
        type: 'info',
        relatedType: 'none',
        createdBy: updatedBy
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.success(null, req.t('call.updated'));
  } catch (error) {
    console.error('[UPDATE_CALL_LOG_ERROR]', { id: req.params.id, message: error.message, stack: error.stack, body: req.body });
    res.fail(req.t('call.failedUpdate'), 500, 'CALL_LOG_UPDATE_ERROR');
  }
};

/**
 * Delete call log
 */
const deleteCallLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.fail(req.t('generic.validationError'), 400, 'ID_REQUIRED');
    }

    // Get call log details before deleting for notification
    const callLog = await callLogsModel.getCallLogById(id);
    
    if (!callLog) {
      return res.fail(req.t('generic.notFound'), 404, 'CALL_LOG_NOT_FOUND');
    }

    const result = await callLogsModel.deleteCallLog(id);

    if (!result) {
      return res.fail(req.t('generic.notFound'), 404, 'CALL_LOG_NOT_FOUND');
    }

    // Send notification to all admins
    try {
      const callTypeText = callLog.call_type === 'incoming' ? 'واردة' : 'صادرة';
      const topicText = callLog.topic ? ` - ${callLog.topic}` : '';
      const deletedBy = req.user?.id || null;
      await sendSystemNotification({
        title: 'حذف مكالمة',
        message: `تم حذف مكالمة ${callTypeText} من ${callLog.caller_name}${topicText}`,
        type: 'warning',
        relatedType: 'none',
        createdBy: deletedBy
      });
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    res.success(null, req.t('call.deleted'));
  } catch (error) {
    console.error('[DELETE_CALL_LOG_ERROR]', { id: req.params.id, message: error.message, stack: error.stack });
    res.fail(req.t('call.failedDelete'), 500, 'CALL_LOG_DELETE_ERROR');
  }
};

module.exports = {
  getAllCallLogs,
  getCallLogById,
  createCallLog,
  updateCallLog,
  deleteCallLog
};
