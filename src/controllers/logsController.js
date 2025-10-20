const logsModel = require('../models/logsModel');

/**
 * Get all logs with pagination
 */
const getAllLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const logs = await logsModel.getAllLogs(page, limit);
    const totalCount = await logsModel.getLogsCount();
    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      data: logs,
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
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب السجلات',
      error: error.message
    });
  }
};

/**
 * Get log by ID
 */
const getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف السجل مطلوب'
      });
    }

    const log = await logsModel.getLogById(id);

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'السجل غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب السجل',
      error: error.message
    });
  }
};

/**
 * Get logs by employee ID
 */
const getLogsByEmployeeId = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الموظف مطلوب'
      });
    }

    const logs = await logsModel.getLogsByEmployeeId(employeeId, page, limit);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching employee logs:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجلات الموظف',
      error: error.message
    });
  }
};

/**
 * Get logs by action
 */
const getLogsByAction = async (req, res) => {
  try {
    const { action } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'نوع الإجراء مطلوب'
      });
    }

    const logs = await logsModel.getLogsByAction(action, page, limit);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching action logs:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجلات الإجراء',
      error: error.message
    });
  }
};

/**
 * Create a new log entry
 */
const createLog = async (req, res) => {
  try {
    const { employee_id, action, description } = req.body;

    if (!action || !description) {
      return res.status(400).json({
        success: false,
        message: 'الإجراء والوصف مطلوبان'
      });
    }

    const logData = {
      employee_id,
      action,
      description
    };

    const logId = await logsModel.createLog(logData);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء السجل بنجاح',
      data: { id: logId }
    });
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء السجل',
      error: error.message
    });
  }
};

/**
 * Delete old logs
 */
const deleteOldLogs = async (req, res) => {
  try {
    const { days } = req.body;
    const daysToKeep = days || 90; // Default to 90 days

    const deletedCount = await logsModel.deleteOldLogs(daysToKeep);

    res.status(200).json({
      success: true,
      message: `تم حذف ${deletedCount} سجل أقدم من ${daysToKeep} يوم`,
      data: { deletedCount, daysKept: daysToKeep }
    });
  } catch (error) {
    console.error('Error deleting old logs:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف السجلات القديمة',
      error: error.message
    });
  }
};

/**
 * Get logs within date range
 */
const getLogsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'تاريخ البداية والنهاية مطلوبان'
      });
    }

    const logs = await logsModel.getLogsByDateRange(startDate, endDate, page, limit);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        currentPage: page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching logs by date range:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب السجلات حسب النطاق الزمني',
      error: error.message
    });
  }
};

/**
 * Get logs statistics
 */
const getLogsStats = async (req, res) => {
  try {
    const totalCount = await logsModel.getLogsCount();
    
    // You can add more statistics here based on your needs
    const stats = {
      totalLogs: totalCount,
      // Add more stats as needed
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching logs stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات السجلات',
      error: error.message
    });
  }
};

module.exports = {
  getAllLogs,
  getLogById,
  getLogsByEmployeeId,
  getLogsByAction,
  createLog,
  deleteOldLogs,
  getLogsByDateRange,
  getLogsStats
};