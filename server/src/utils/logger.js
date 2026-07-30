/**
 * Production-ready Structured Logger.
 * Supports ISO timestamps, log levels (info, warn, error, debug), and correlation metadata.
 */
const LOG_LEVELS = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const CURRENT_LEVEL = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function formatLog(level, message, meta = {}) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service: 'nexora-api',
    env: process.env.NODE_ENV || 'production',
    message,
    ...meta,
  });
}

export const logger = {
  info(message, meta) {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.info) {
      console.log(formatLog('info', message, meta));
    }
  },
  warn(message, meta) {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.warn) {
      console.warn(formatLog('warn', message, meta));
    }
  },
  error(message, meta) {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.error) {
      console.error(formatLog('error', message, meta));
    }
  },
  http(message, meta) {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.http) {
      console.log(formatLog('http', message, meta));
    }
  },
  debug(message, meta) {
    if (LOG_LEVELS[CURRENT_LEVEL] >= LOG_LEVELS.debug) {
      console.debug(formatLog('debug', message, meta));
    }
  },
};

export default logger;
