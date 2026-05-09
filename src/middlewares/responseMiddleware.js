/**
 * Attach unified response helpers to the response object.
 * Shape: { success: boolean, message: string, data?: any, meta?: any, errorCode?: string, errors?: any }
 */
const responseMiddleware = (req, res, next) => {
  res.success = (data = null, message = 'OK', status = 200, meta = null) => {
    // Architectural Guard: Ensure list responses are never null
    // If data is null/undefined and the request was likely a list (GET), 
    // we default to [] to prevent frontend .map() crashes.
    let safeData = data;
    if (req.method === 'GET' && (data === null || data === undefined)) {
      // Note: This is a heuristic. Specific resource GETs (by ID) might expect null,
      // but collections should always be [].
      // We check if the URL ends with an ID (numeric) or not.
      const isCollection = !/\/\d+$/.test(req.path);
      if (isCollection) safeData = [];
    }

    const body = { success: true, message, data: safeData };
    if (meta) {
      if (typeof meta === 'object' && meta !== null) {
        Object.assign(body, meta);
        body.meta = meta;
      } else {
        body.meta = meta;
      }
    }
    return res.status(status).json(body);
  };

  res.created = (data = null, message = 'Created', meta) => res.success(data, message, 201, meta);

  res.fail = (message = 'Bad request', status = 400, errorCode = 'BAD_REQUEST', errors = null) => {
    const body = { 
      success: false, 
      message, 
      errorCode,
      data: [] // Defensive: ensure data exists even on failure to prevent .map() crashes
    };
    if (errors) body.errors = errors;
    return res.status(status).json(body);
  };

  next();
};

module.exports = { responseMiddleware };
