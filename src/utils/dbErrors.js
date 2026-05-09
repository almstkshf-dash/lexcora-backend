/**
 * Utility to handle common MySQL database errors and map them to user-friendly messages.
 */

const isConstraintError = (err) => {
  if (!err) return false;
  const message = err.message || '';
  const code = err.code || '';
  return (
    code === 'ER_ROW_IS_REFERENCED_2' ||
    code === 'ER_ROW_IS_REFERENCED' ||
    message.includes('ER_ROW_IS_REFERENCED_2') ||
    message.includes('foreign key constraint fails')
  );
};

const getConstraintErrorMessage = (req) => {
  if (req.t) {
    const translated = req.t('generic.cannotDeleteHasRecords');
    if (translated !== 'generic.cannotDeleteHasRecords') {
      return translated;
    }
  }
  
  // Default Arabic message if translation key is missing or locale is Arabic
  if (req.locale === 'ar') {
    return 'لا يمكن حذف هذا السجل لوجود بيانات مرتبطة به. يرجى حذف السجلات المرتبطة أولاً أو إيقاف تفعيل السجل بدلاً من الحذف.';
  }
  
  return 'Cannot delete this record because it has associated data. Please delete associated records first or deactivate this record instead.';
};

module.exports = {
  isConstraintError,
  getConstraintErrorMessage
};
