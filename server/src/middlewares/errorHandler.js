import { ApiError } from '../utils/apiError.js';
import logger from '../utils/logger.js';

// ─── Mongoose / DB Error Formatters ────────────────────────────────────────────

const handleCastError = (err) =>
  ApiError.badRequest(`Invalid value '${err.value}' for field '${err.path}'.`);

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue?.[field];
  return ApiError.conflict(`Duplicate value '${value}' for ${field}. Please use another value.`);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  return ApiError.validationError(errors, 'Mongoose validation failed.');
};

// ─── JWT Error Formatters ─────────────────────────────────────────────────────

const handleJWTError = () => ApiError.unauthorized('Invalid authentication token.');

const handleJWTExpiredError = () =>
  ApiError.unauthorized('Your session has expired. Please sign in again.');

// ─── Response Senders ─────────────────────────────────────────────────────────

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    errors: err.errors || [],
    stack: err.stack,
    error: err,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors?.length > 0 && { errors: err.errors }),
    });
  } else {
    // Non-operational (programmer) errors: hide details from client
    logger.error('NON-OPERATIONAL ERROR 💥', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred.',
    });
  }
};

// ─── Global Error Handler Middleware ──────────────────────────────────────────

/**
 * Centralized Express global error handler.
 * Must be registered AFTER all routes in app.js.
 *
 * Handles: Mongoose errors, JWT errors, custom ApiError, and unknown errors.
 */
export const errorHandler = (err, req, res, _next) => {
  let error = err;

  // Ensure error has required props
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // Log all errors internally
  logger.error(`[${req.method}] ${req.originalUrl} — ${error.message}`, error);

  // Transform known framework-specific errors into ApiError instances
  if (error.name === 'CastError') {
    error = handleCastError(error);
  } else if (error.code === 11000) {
    error = handleDuplicateKeyError(error);
  } else if (error.name === 'ValidationError') {
    error = handleValidationError(error);
  } else if (error.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (error.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  if (process.env.NODE_ENV === 'development') {
    sendDevError(error, res);
  } else {
    sendProdError(error, res);
  }
};

// ─── Not Found Handler ────────────────────────────────────────────────────────

/**
 * Catch-all middleware for unmatched routes.
 * Register AFTER all routes, BEFORE the errorHandler.
 */
export const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Route '${req.method} ${req.originalUrl}' not found on this server.`));
};
