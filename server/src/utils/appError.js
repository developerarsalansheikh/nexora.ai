/**
 * Custom Operational exception helper to isolate business logic exceptions
 * from system failures, helping the global handler return standardized HTTP responses.
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication credentials missing or invalid') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access to this resource is forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict occurred') {
    super(message, 409);
  }
}
