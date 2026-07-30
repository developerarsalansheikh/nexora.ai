/**
 * Standard error messages used across the Nexora.ai API.
 * Centralizing strings prevents typos and enables future i18n support.
 */
export const ERROR_MESSAGES = Object.freeze({
  // ── Auth ──────────────────────────────────────────────────────────────────
  UNAUTHORIZED: 'Authentication credentials missing or invalid.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  TOKEN_INVALID: 'The provided authentication token is invalid.',
  ACCOUNT_NOT_FOUND: 'No account found with the provided credentials.',
  INVALID_CREDENTIALS: 'Email or password is incorrect.',
  EMAIL_ALREADY_EXISTS: 'An account with this email address already exists.',

  // ── Validation ────────────────────────────────────────────────────────────
  VALIDATION_FAILED: 'One or more validation errors occurred.',
  REQUIRED_FIELD: (field) => `${field} is required.`,
  INVALID_FORMAT: (field) => `${field} format is invalid.`,

  // ── Resource ──────────────────────────────────────────────────────────────
  NOT_FOUND: (resource = 'Resource') => `${resource} not found.`,
  ALREADY_EXISTS: (resource = 'Resource') => `${resource} already exists.`,
  CONFLICT: 'A conflict occurred with an existing resource.',

  // ── Server ────────────────────────────────────────────────────────────────
  INTERNAL_ERROR: 'An unexpected server error occurred. Please try again.',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable. Please retry later.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait before retrying.',
  PAYLOAD_TOO_LARGE: 'Request payload exceeds the maximum allowed size.',
});

/**
 * Standard success messages used across the Nexora.ai API.
 */
export const SUCCESS_MESSAGES = Object.freeze({
  // ── Auth ──────────────────────────────────────────────────────────────────
  LOGIN_SUCCESS: 'Signed in successfully.',
  LOGOUT_SUCCESS: 'Signed out successfully.',
  REGISTER_SUCCESS: 'Account created successfully.',
  PASSWORD_RESET_SENT: 'Password reset link sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Password updated successfully.',

  // ── CRUD ──────────────────────────────────────────────────────────────────
  CREATED: (resource = 'Resource') => `${resource} created successfully.`,
  UPDATED: (resource = 'Resource') => `${resource} updated successfully.`,
  DELETED: (resource = 'Resource') => `${resource} deleted successfully.`,
  FETCHED: (resource = 'Resource') => `${resource} retrieved successfully.`,

  // ── Invites ───────────────────────────────────────────────────────────────
  INVITE_SENT: 'Invitation sent successfully.',
  INVITE_ACCEPTED: 'Invitation accepted.',
});
