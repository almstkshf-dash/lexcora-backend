const { v4: uuidv4 } = require('uuid');

const requestLogger = (options = {}) => {
  const slowThresholdMs = options.slowThresholdMs || 1000;

  return (req, res, next) => {
    const start = process.hrtime.bigint();
    const correlationId = req.headers['x-request-id'] || uuidv4();
    req.correlationId = correlationId;

    res.setHeader('X-Request-Id', correlationId);

    res.on('finish', () => {
      const end = process.hrtime.bigint();
      const durationMs = Number(end - start) / 1e6;
      const log = {
        type: durationMs > slowThresholdMs ? 'slow' : 'access',
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration_ms: Number(durationMs.toFixed(2)),
        correlation_id: correlationId,
        user_id: req.user?.id,
        ip: req.ip
      };
      console.log(JSON.stringify(log));
    });

    next();
  };
};

module.exports = {
  requestLogger
};
