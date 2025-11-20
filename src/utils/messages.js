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
