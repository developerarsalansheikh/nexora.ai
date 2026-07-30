import { HTTP_STATUS } from '../constants/index.js';

/**
 * Custom operational error class for Nexora.ai API.
 * Extends native Error to carry HTTP status, operational flag, and field-level validation errors.
 *
 * @example
 * throw ApiError.notFound('Project not found');
 * throw new ApiError(422, 'Validation failed', true, [], err.stack);
 */
export class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} [message='Something went wrong'] - Error message
   * @param {boolean} [isOperational=true] - Operational vs programmer error
   * @param {Array}  [errors=[]] - Field-level validation errors array
   * @param {string} [stack=''] - Custom stack trace
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    isOperational = true,
    errors = [],
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ─── Static Factories ─────────────────────────────────────────────────────

  static badRequest(message = 'Bad request', errors = []) {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, true, errors);
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Access denied') {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message = 'Resource conflict') {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static validationError(errors = [], message = 'Validation failed') {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, true, errors);
  }

  static tooManyRequests(message = 'Too many requests. Please slow down.') {
    return new ApiError(HTTP_STATUS.TOO_MANY_REQUESTS, message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, false);
  }
}

export default ApiError;
