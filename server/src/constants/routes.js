/**
 * Server-side API route path constants.
 * Keeps route strings DRY and avoids magic strings in route files.
 */
export const API_PREFIX = '/api/v1';

export const API_ROUTES = Object.freeze({
  // ── Health ────────────────────────────────────────────────────────────────
  HEALTH: `${API_PREFIX}/health`,

  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: `${API_PREFIX}/auth`,
  AUTH_REGISTER: `${API_PREFIX}/auth/register`,
  AUTH_LOGIN: `${API_PREFIX}/auth/login`,
  AUTH_LOGOUT: `${API_PREFIX}/auth/logout`,
  AUTH_REFRESH: `${API_PREFIX}/auth/refresh`,
  AUTH_ME: `${API_PREFIX}/auth/me`,

  // ── Users ─────────────────────────────────────────────────────────────────
  USERS: `${API_PREFIX}/users`,

  // ── Workspaces ────────────────────────────────────────────────────────────
  WORKSPACES: `${API_PREFIX}/workspaces`,

  // ── Projects ─────────────────────────────────────────────────────────────
  PROJECTS: `${API_PREFIX}/projects`,

  // ── Tasks ─────────────────────────────────────────────────────────────────
  TASKS: `${API_PREFIX}/tasks`,

  // ── Sprints ───────────────────────────────────────────────────────────────
  SPRINTS: `${API_PREFIX}/sprints`,

  // ── Notifications ────────────────────────────────────────────────────────
  NOTIFICATIONS: `${API_PREFIX}/notifications`,
});

/**
 * Regex validation patterns used in validation schemas.
 */
export const REGEX = Object.freeze({
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  MONGO_ID: /^[a-f\d]{24}$/i,
  URL: /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/,
  PHONE: /^\+?[\d\s\-().]{7,20}$/,
});

/**
 * File upload size and type constraints.
 */
export const FILE_LIMITS = Object.freeze({
  AVATAR_MAX_SIZE_BYTES: 2 * 1024 * 1024, // 2 MB
  ATTACHMENT_MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_ATTACHMENT_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/zip',
  ],
});

/**
 * Pagination defaults.
 */
export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});

/**
 * HTTP Status Codes — avoids magic numbers in controllers.
 */
export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
});
