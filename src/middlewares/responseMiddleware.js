/**
 * Attach unified response helpers to the response object.
 * Shape: { success: boolean, message: string, data?: any, meta?: any, errorCode?: string, errors?: any }
 */
const responseMiddleware = (req, res, next) => {
  res.success = (data = null, message = 'OK', status = 200, meta) => {
    const body = { success: true, message, data };
    if (meta) body.meta = meta;
    return res.status(status).json(body);
  };

  res.created = (data = null, message = 'Created', meta) => res.success(data, message, 201, meta);

  res.fail = (message = 'Bad request', status = 400, errorCode = 'BAD_REQUEST', errors) => {
    const body = { success: false, message, errorCode };
    if (errors) body.errors = errors;
    return res.status(status).json(body);
  };

  next();
};

module.exports = { responseMiddleware };
