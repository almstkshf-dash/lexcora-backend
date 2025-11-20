const { getMessage } = require('../utils/messages');

/**
 * Lightweight i18n middleware.
 * Detects locale from:
 *  - query ?lang=ar|en
 *  - header x-lang: ar|en
 *  - Accept-Language header preferring 'ar'
 * Defaults to 'en'.
 */
const i18nMiddleware = (req, res, next) => {
  const headerLang = req.headers['x-lang'];
  const queryLang = req.query.lang;
  const acceptLanguage = req.headers['accept-language'] || '';

  let locale = 'en';
  if (queryLang && ['ar', 'en'].includes(queryLang.toLowerCase())) {
    locale = queryLang.toLowerCase();
  } else if (headerLang && ['ar', 'en'].includes(headerLang.toLowerCase())) {
    locale = headerLang.toLowerCase();
  } else if (acceptLanguage.toLowerCase().startsWith('ar')) {
    locale = 'ar';
  }

  req.locale = locale;
  req.t = (key) => getMessage(key, locale);
  next();
};

module.exports = { i18nMiddleware };
