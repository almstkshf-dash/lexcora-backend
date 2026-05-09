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
    cannotDeleteHasRecords: { 
      en: 'Cannot delete this record because it has associated data. Please deactivate it instead.', 
      ar: 'لا يمكن حذف هذا السجل لوجود بيانات مرتبطة به. يرجى إيقاف تفعيله بدلاً من الحذف.' 
    },
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
  tasks: {
    created: { en: 'Task created successfully', ar: 'تم إنشاء المهمة بنجاح' },
    createError: { en: 'Failed to create task', ar: 'فشل في إنشاء المهمة' },
    updated: { en: 'Task updated successfully', ar: 'تم تحديث المهمة بنجاح' },
    notFound: { en: 'Task not found', ar: 'المهمة غير موجودة' },
    updateError: { en: 'Failed to update task', ar: 'فشل في تحديث المهمة' },
    deleted: { en: 'Task deleted successfully', ar: 'تم حذف المهمة بنجاح' },
    deleteError: { en: 'Failed to delete task', ar: 'فشل في حذف المهمة' },
    fetchError: { en: 'Failed to fetch tasks', ar: 'فشل في تحميل المهام' },
  },
  employee: {
    failedFetchEmployees: { en: 'Failed to fetch employees', ar: 'فشل في تحميل قائمة الموظفين' },
    employeeCreated: { en: 'Employee created successfully', ar: 'تم إضافة الموظف بنجاح' },
    failedCreateEmployee: { en: 'Failed to create employee', ar: 'فشل في إضافة الموظف' },
    employeeUpdated: { en: 'Employee updated successfully', ar: 'تم تحديث بيانات الموظف بنجاح' },
    failedUpdateEmployee: { en: 'Failed to update employee', ar: 'فشل في تحديث بيانات الموظف' },
    employeeDeleted: { en: 'Employee deleted successfully', ar: 'تم حذف الموظف بنجاح' },
    failedDeleteEmployee: { en: 'Failed to delete employee', ar: 'فشل في حذف الموظف' },
  },
  notify: {
    serverError: { en: 'Server error. Please try again later.', ar: 'خطأ في الخادم. حاول لاحقاً.' }
  },
  notifications: {
    failedFetch: { en: 'Failed to fetch notifications', ar: 'فشل في جلب التنبيهات' },
    failedMarkRead: { en: 'Failed to mark notification as read', ar: 'فشل في تحديد التنبيه كمقروء' },
    failedDelete: { en: 'Failed to delete notification', ar: 'فشل في حذف التنبيه' },
    notFound: { en: 'Notification not found', ar: 'التنبيه غير موجود' },
    accessDenied: { en: 'Access denied', ar: 'تم رفض الوصول' },
    markedAllRead: { en: 'All notifications marked as read', ar: 'تم تحديد جميع التنبيهات كمقروءة' },
    titleMessageRequired: { en: 'Title and message are required', ar: 'العنوان والرسالة مطلوبان' },
  },
  accounting: {
    failedFetchAccounts: { en: 'Failed to fetch accounts', ar: 'فشل في جلب الحسابات' },
    failedCreateAccount: { en: 'Failed to create account', ar: 'فشل في إنشاء الحساب' },
    failedFetchFiscalPeriods: { en: 'Failed to fetch fiscal periods', ar: 'فشل في جلب الفترات المالية' },
    failedCreateFiscalPeriod: { en: 'Failed to create fiscal period', ar: 'فشل في إنشاء الفترة المالية' },
    failedUpdateFiscalPeriod: { en: 'Failed to update fiscal period', ar: 'فشل في تحديث الفترة المالية' },
    failedFetchJournalEntries: { en: 'Failed to fetch journal entries', ar: 'فشل في جلب قيود اليومية' },
    failedCreateJournalEntry: { en: 'Failed to create journal entry', ar: 'فشل في إنشاء قيد اليومية' },
    failedFetchReports: { en: 'Failed to fetch report data', ar: 'فشل في جلب بيانات التقرير' },
    failedSetBudget: { en: 'Failed to set budget', ar: 'فشل في تعيين الميزانية' },
    failedFetchBudgets: { en: 'Failed to fetch budgets', ar: 'فشل في جلب الميزانيات' },
    depreciationQueued: { en: 'Depreciation job queued successfully', ar: 'تم وضع وظيفة الإهلاك في قائمة الانتظار بنجاح' },
  },
  case: {
    failedFetch: { en: 'Failed to fetch cases', ar: 'فشل في جلب القضايا' },
    failedCreate: { en: 'Failed to create case', ar: 'فشل في إنشاء القضية' },
    failedUpdate: { en: 'Failed to update case', ar: 'فشل في تحديث القضية' },
    failedDelete: { en: 'Failed to delete case', ar: 'فشل في حذف القضية' },
    notFound: { en: 'Case not found', ar: 'القضية غير موجودة' },
    detailsRetrieved: { en: 'Case details retrieved successfully', ar: 'تم استرداد تفاصيل القضية بنجاح' },
    partyAdded: { en: 'Party added to case successfully', ar: 'تم إضافة الطرف إلى القضية بنجاح' },
    partyRemoved: { en: 'Party removed from case successfully', ar: 'تم إزالة الطرف من القضية بنجاح' },
    docDeleted: { en: 'Document deleted successfully', ar: 'تم حذف المستند بنجاح' },
    noteUpdated: { en: 'Note updated successfully', ar: 'تم تحديث الملاحظة بنجاح' },
  },
  session: {
    failedFetch: { en: 'Failed to fetch sessions', ar: 'فشل في جلب الجلسات' },
    failedCreate: { en: 'Failed to create session', ar: 'فشل في إنشاء الجلسة' },
    failedUpdate: { en: 'Failed to update session', ar: 'فشل في تحديث الجلسة' },
    failedDelete: { en: 'Failed to delete session', ar: 'فشل في حذف الجلسة' },
    notFound: { en: 'Session not found', ar: 'الجلسة غير موجودة' },
  },
  court: {
    failedFetch: { en: 'Failed to fetch courts', ar: 'فشل في جلب المحاكم' },
    failedCreate: { en: 'Failed to create court', ar: 'فشل في إنشاء المحكمة' },
    failedUpdate: { en: 'Failed to update court', ar: 'فشل في تحديث المحكمة' },
    failedDelete: { en: 'Failed to delete court', ar: 'فشل في حذف المحكمة' },
    notFound: { en: 'Court not found', ar: 'المحكمة غير موجودة' },
    deleted: { en: 'Court deleted successfully', ar: 'تم حذف المحكمة بنجاح' },
  },
  branch: {
    failedFetch: { en: 'Failed to fetch branches', ar: 'فشل في جلب الفروع' },
    failedCreate: { en: 'Failed to create branch', ar: 'فشل في إنشاء الفرع' },
    failedUpdate: { en: 'Failed to update branch', ar: 'فشل في تحديث الفرع' },
    failedDelete: { en: 'Failed to delete branch', ar: 'فشل في حذف الفرع' },
    notFound: { en: 'Branch not found', ar: 'الفرع غير موجود' },
  },
  department: {
    failedFetch: { en: 'Failed to fetch departments', ar: 'فشل في جلب الأقسام' },
    failedCreate: { en: 'Failed to create department', ar: 'فشل في إنشاء القسم' },
    failedUpdate: { en: 'Failed to update department', ar: 'فشل في تحديث القسم' },
    failedDelete: { en: 'Failed to delete department', ar: 'فشل في حذف القسم' },
    notFound: { en: 'Department not found', ar: 'القسم غير موجود' },
  },
  asset: {
    failedFetch: { en: 'Failed to fetch assets', ar: 'فشل في جلب الأصول' },
    failedCreate: { en: 'Failed to create asset', ar: 'فشل في إنشاء الأصل' },
    failedUpdate: { en: 'Failed to update asset', ar: 'فشل في تحديث الأصل' },
    failedDelete: { en: 'Failed to delete asset', ar: 'فشل في حذف الأصل' },
    notFound: { en: 'Asset not found', ar: 'الأصل غير موجود' },
    disposed: { en: 'Asset disposed successfully', ar: 'تم التخلص من الأصل بنجاح' },
    transferred: { en: 'Asset transferred successfully', ar: 'تم نقل الأصل بنجاح' },
    revalued: { en: 'Asset revalued successfully', ar: 'تم إعادة تقييم الأصل بنجاح' },
    docDeleted: { en: 'Asset document deleted successfully', ar: 'تم حذف مستند الأصل بنجاح' },
    settingsUpdated: { en: 'Depreciation settings updated successfully', ar: 'تم تحديث إعدادات الإهلاك بنجاح' },
  },
  warning: {
    failedFetch: { en: 'Failed to fetch warnings', ar: 'فشل في جلب الإنذارات' },
    failedCreate: { en: 'Failed to create warning', ar: 'فشل في إنشاء الإنذار' },
    failedUpdate: { en: 'Failed to update warning', ar: 'فشل في تحديث الإنذار' },
    failedDelete: { en: 'Failed to delete warning', ar: 'فشل في حذف الإنذار' },
    notFound: { en: 'Warning not found', ar: 'الإنذار غير موجود' },
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
