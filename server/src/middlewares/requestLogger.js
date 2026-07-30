import logger from '../utils/logger.js';

/**
 * HTTP Request telemetry logger middleware.
 * Logs method, path, status, duration, and bytes for every request.
 * Integrates with the centralized logger utility.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;
    const contentLength = res.get('Content-Length') || '-';

    const msg = `${method} ${originalUrl} ${statusCode} ${duration}ms — ${contentLength}B — ${ip}`;

    if (statusCode >= 500) {
      logger.error(msg);
    } else if (statusCode >= 400) {
      logger.warn(msg);
    } else {
      logger.http(msg);
    }
  });

  next();
};

export default requestLogger;
export { requestLogger };
