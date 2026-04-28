/**
 * Simple bilingual message catalog.
 * Extend with more keys as you localize additional controllers.
 */
const messages = {
  generic: {
    ok: { en: 'OK', ar: 'حسناً' },
    created: { en: 'Created', ar: 'تم الإنشاء' },
    notFound: { en: 'Not found', ar: 'غير موجود' },
    validationError: { en: 'Validation failed', ar: 'فشل التحقق' },
    internalError: { en: 'Internal server error', ar: 'خطأ داخلي في الخادم' },
  },
  auth: {
    loginSuccess: { en: 'Login successful', ar: 'تم تسجيل الدخول بنجاح' },
    logoutSuccess: { en: 'Logged out successfully - cookie cleared', ar: 'تم تسجيل الخروج ومسح الكوكيز بنجاح' },
    profileFetched: { en: 'Profile fetched', ar: 'تم جلب الملف الشخصي' },
    registrationSuccess: { en: 'User registered successfully', ar: 'تم تسجيل المستخدم بنجاح' },
    passwordChanged: { en: 'Password changed successfully', ar: 'تم تغيير كلمة المرور بنجاح' },
    credentialsRequired: { en: 'Username and password are required', ar: 'اسم المستخدم وكلمة المرور مطلوبان' },
    currentPasswordRequired: { en: 'Current password and new password are required', ar: 'كلمة المرور الحالية والجديدة مطلوبتان' },
  },
  ai: {
    reply: { en: 'Legal assistant reply', ar: 'رد المساعد القانوني' },
    quotaExceeded: { en: 'OpenAI API quota exceeded', ar: 'تم تجاوز الحد المسموح به لواجهة برمجة تطبيقات OpenAI' },
    invalidKey: { en: 'Invalid OpenAI API key', ar: 'مفتاح واجهة برمجة تطبيقات OpenAI غير صالح' },
    genericError: { en: 'Internal server error', ar: 'خطأ داخلي في الخادم' },
    insufficientInfo: { en: 'I do not have enough information to answer based on UAE legislation.', ar: 'لا تتوفر لدي معلومات كافية للإجابة استناداً إلى التشريعات الإماراتية.' },
  },
  finance: {
    failedFetchTransactions: { en: 'Failed to fetch transactions', ar: 'فشل في جلب المعاملات' },
    failedFetchTransaction: { en: 'Failed to fetch transaction', ar: 'فشل في جلب المعاملة' },
    failedCreateTransaction: { en: 'Failed to create transaction', ar: 'فشل في إنشاء المعاملة' },
    failedUpdateTransaction: { en: 'Failed to update transaction', ar: 'فشل في تحديث المعاملة' },
    failedDeleteTransaction: { en: 'Failed to delete transaction', ar: 'فشل في حذف المعاملة' },
    failedDeleteAttachment: { en: 'Failed to delete attachment', ar: 'فشل في حذف المرفق' },
    failedFetchTransactionStatistics: { en: 'Failed to fetch transaction statistics', ar: 'فشل في جلب إحصائيات المعاملات' },
    failedFetchExpenses: { en: 'Failed to fetch expenses', ar: 'فشل في جلب المصروفات' },
    validationAmountOperationRequired: { en: 'Amount and operation are required', ar: 'المبلغ ونوع العملية مطلوبان' },
    failedFetchFinanceClients: { en: 'Failed to fetch finance clients', ar: 'فشل في جلب عملاء المالية' },
    failedCheckDuplicate: { en: 'Failed to check duplicate', ar: 'فشل في التحقق من التكرار' },
  },
  bank: {
    noFileUploaded: { en: 'No file uploaded', ar: 'لم يتم تحميل أي ملف' },
    syncJobStarted: { en: 'Sync job started', ar: 'تم بدء عملية المزامنة' },
    failedFetchBankAccounts: { en: 'Failed to fetch bank accounts', ar: 'فشل في جلب حسابات البنك' },
    failedFetchBankAccount: { en: 'Failed to fetch bank account', ar: 'فشل في جلب حساب البنك' },
    failedCreateBankAccount: { en: 'Failed to create bank account', ar: 'فشل في إنشاء حساب البنك' },
    failedUpdateBankAccount: { en: 'Failed to update bank account', ar: 'فشل في تحديث حساب البنك' },
    failedDeleteBankAccount: { en: 'Failed to delete bank account', ar: 'فشل في حذف حساب البنك' },
    failedUpdateAccountBalance: { en: 'Failed to update account balance', ar: 'فشل في تحديث رصيد الحساب' },
    failedFetchBankAccountLogs: { en: 'Failed to fetch bank account logs', ar: 'فشل في جلب سجلات حساب البنك' },
    failedCreateBankAccountLog: { en: 'Failed to create bank account log', ar: 'فشل في إنشاء سجل حساب البنك' },
    failedUpdateBankAccountLog: { en: 'Failed to update bank account log', ar: 'فشل في تحديث سجل حساب البنك' },
    failedDeleteBankAccountLog: { en: 'Failed to delete bank account log', ar: 'فشل في حذف سجل حساب البنك' },
  },
  party: {
    failedFetchParties: { en: 'Failed to fetch parties', ar: 'فشل في جلب الأطراف' },
    failedFetchPartiesByBranch: { en: 'Failed to fetch parties by branch', ar: 'فشل في جلب الأطراف حسب الفرع' },
    failedCreateParty: { en: 'Failed to create party', ar: 'فشل في إنشاء الطرف' },
    partyDeleted: { en: 'Party deleted', ar: 'تم حذف الطرف' },
    partyNotFound: { en: 'Party not found', ar: 'الطرف غير موجود' },
    failedDeleteParty: { en: 'Failed to delete party', ar: 'فشل في حذف الطرف' },
    failedFetchParty: { en: 'Failed to fetch party', ar: 'فشل في جلب الطرف' },
    partyUpdated: { en: 'Party updated', ar: 'تم تحديث الطرف' },
    failedUpdateParty: { en: 'Failed to update party', ar: 'فشل في تحديث الطرف' },
    failedFetchPartyCases: { en: 'Failed to fetch party cases', ar: 'فشل في جلب قضايا الطرف' },
    failedFetchPotentialClients: { en: 'Failed to fetch potential clients', ar: 'فشل في جلب العملاء المحتملين' },
    failedSearchParties: { en: 'Failed to search parties', ar: 'فشل في البحث عن الأطراف' },
    validationNamePhoneEmailRequired: { en: 'At least one of name, phone, or email is required', ar: 'مطلوب واحد على الأقل من الاسم أو الهاتف أو البريد الإلكتروني' },
    failedCheckDuplicate: { en: 'Failed to check duplicate', ar: 'فشل في التحقق من التكرار' },
  },
};

const getMessage = (key, locale = 'en') => {
  const segments = key.split('.');
  let node = messages;
  for (const seg of segments) {
    node = node?.[seg];
    if (!node) break;
  }
  if (node && typeof node === 'object' && (node.en || node.ar)) {
    return locale === 'ar' ? (node.ar || node.en) : (node.en || node.ar);
  }
  return key; // Fallback to key if missing
};

module.exports = {
  getMessage,
  messages,
};
