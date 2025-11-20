const { AppError } = require('../utils/errors');

/**
 * Centralized error handler to keep API responses consistent.
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError ? err.errorCode : 'INTERNAL_ERROR';
  const message = err.message || 'Internal server error';

  // Minimal structured logging hook; align with your logger later
  console.error('[API_ERROR]', {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    errorCode,
    message,
    stack: err.stack
  });

  return res.status(statusCode).json({
    success: false,
    message,
    errorCode,
    errors: err.details
  });
};

module.exports = { errorHandler };
