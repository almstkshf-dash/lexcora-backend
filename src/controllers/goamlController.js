const goamlModel = require('../models/goamlModel');

/**
 * Get all GoAML records
 */
const getAllGoamlRecords = async (req, res) => {
  try {
    const records = await goamlModel.getAllGoamlRecords();
    const count = records.length;

    res.status(200).json({
      success: true,
      data: records,
      count
    });
  } catch (error) {
    console.error('Error fetching GoAML records:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجلات GoAML',
      error: error.message
    });
  }
};

/**
 * Get GoAML record by ID
 */
const getGoamlRecordById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف السجل مطلوب'
      });
    }

    const record = await goamlModel.getGoamlRecordById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'السجل غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Error fetching GoAML record:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب السجل',
      error: error.message
    });
  }
};

/**
 * Create new GoAML record
 */
const createGoamlRecord = async (req, res) => {
  try {
    const {
      name,
      phone,
      type,
      note,
      status
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'الاسم مطلوب'
      });
    }

    // Validate status values
    const validStatuses = ['safe', 'compliant', 'under_review'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'حالة غير صالحة. القيم المسموحة: safe, compliant, under_review'
      });
    }

    // Validate type values
    const validTypes = ['فرد', 'شركة', 'كيان', 'منظمة'];
    if (!type || !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'نوع غير صالح. القيم المسموحة: فرد, شركة, كيان, منظمة'
      });
    }

    const created_by = req.user?.id || null;

    const recordId = await goamlModel.createGoamlRecord({
      name,
      phone,
      type,
      note,
      status: status || 'under_review',
      created_by
    });

    res.status(201).json({
      success: true,
      message: 'تم إضافة السجل بنجاح',
      data: { id: recordId }
    });
  } catch (error) {
    console.error('Error creating GoAML record:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة السجل',
      error: error.message
    });
  }
};

/**
 * Update GoAML record
 */
const updateGoamlRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      phone,
      type,
      note,
      status
    } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف السجل مطلوب'
      });
    }

    // Validate status values if provided
    if (status) {
      const validStatuses = ['safe', 'compliant', 'under_review'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'حالة غير صالحة. القيم المسموحة: safe, compliant, under_review'
        });
      }
    }

    const result = await goamlModel.updateGoamlRecord(id, {
      name,
      phone,
      note,
      type,
      status
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'السجل غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم تحديث السجل بنجاح'
    });
  } catch (error) {
    console.error('Error updating GoAML record:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث السجل',
      error: error.message
    });
  }
};

/**
 * Delete GoAML record
 */
const deleteGoamlRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'معرف السجل مطلوب'
      });
    }

    const result = await goamlModel.deleteGoamlRecord(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'السجل غير موجود'
      });
    }

    res.status(200).json({
      success: true,
      message: 'تم حذف السجل بنجاح'
    });
  } catch (error) {
    console.error('Error deleting GoAML record:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف السجل',
      error: error.message
    });
  }
};

module.exports = {
  getAllGoamlRecords,
  getGoamlRecordById,
  createGoamlRecord,
  updateGoamlRecord,
  deleteGoamlRecord
};
