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
    // Invoices
    failedFetchInvoices: { en: 'Failed to fetch invoices', ar: 'فشل في جلب الفواتير' },
    failedFetchInvoice: { en: 'Failed to fetch invoice', ar: 'فشل في جلب الفاتورة' },
    failedFetchClientInvoices: { en: 'Failed to fetch client invoices', ar: 'فشل في جلب فواتير العميل' },
    failedCreateInvoice: { en: 'Failed to create invoice', ar: 'فشل في إنشاء الفاتورة' },
    failedUpdateInvoice: { en: 'Failed to update invoice', ar: 'فشل في تحديث الفاتورة' },
    failedUpdateInvoiceStatus: { en: 'Failed to update invoice status', ar: 'فشل في تحديث حالة الفاتورة' },
    failedDeleteInvoice: { en: 'Failed to delete invoice', ar: 'فشل في حذف الفاتورة' },
    failedUploadAttachments: { en: 'Failed to upload attachments', ar: 'فشل في رفع المرفقات' },
    noFilesProvided: { en: 'No files provided', ar: 'لم يتم تقديم أي ملفات' },
    invoiceDateRequired: { en: 'Invoice date is required', ar: 'تاريخ الفاتورة مطلوب' },
    amountGreaterThanZero: { en: 'Amount must be greater than zero', ar: 'يجب أن يكون المبلغ أكبر من الصفر' },
    atLeastOneItemRequired: { en: 'At least one invoice item is required', ar: 'مطلوب عنصر واحد على الأقل في الفاتورة' },
    statusRequired: { en: 'Status is required', ar: 'الحالة مطلوبة' },
    // Bills
    failedFetchBills: { en: 'Failed to fetch bills', ar: 'فشل في جلب الفواتير المستحقة' },
    failedFetchBill: { en: 'Failed to fetch bill', ar: 'فشل في جلب الفاتورة المستحقة' },
    failedCreateBill: { en: 'Failed to create bill', ar: 'فشل في إنشاء الفاتورة المستحقة' },
    failedUpdateBillStatus: { en: 'Failed to update bill status', ar: 'فشل في تحديث حالة الفاتورة المستحقة' },
    // Payments
    failedCreatePayment: { en: 'Failed to create payment', ar: 'فشل في إنشاء الدفعة' },
    failedFetchPayments: { en: 'Failed to fetch payments', ar: 'فشل في جلب الدفعات' },
    // Petty Cash
    fundNotFound: { en: 'Fund not found', ar: 'الصندوق غير موجود' },
    failedFetchFunds: { en: 'Failed to fetch funds', ar: 'فشل في جلب الصناديق' },
    failedFetchFund: { en: 'Failed to fetch fund', ar: 'فشل في جلب الصندوق' },
    failedCreateFund: { en: 'Failed to create fund', ar: 'فشل في إنشاء الصندوق' },
    fundNameRequired: { en: 'Fund name is required', ar: 'اسم الصندوق مطلوب' },
    failedCreatePettyCashTransaction: { en: 'Failed to create transaction', ar: 'فشل في إنشاء المعاملة' },
    failedFetchFundTransactions: { en: 'Failed to fetch fund transactions', ar: 'فشل في جلب معاملات الصندوق' },
    transactionNotFound: { en: 'Transaction not found', ar: 'المعاملة غير موجودة' },
    attachmentNotFound: { en: 'Attachment not found', ar: 'المرفق غير موجود' },
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
