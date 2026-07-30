/**
 * Client-side user-facing messages.
 * Keeps message strings DRY and ready for future i18n migration.
 */
export const UI_MESSAGES = Object.freeze({
  // ── Generic ───────────────────────────────────────────────────────────────
  LOADING: 'Loading...',
  SAVING: 'Saving changes...',
  SAVED: 'Changes saved.',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  NETWORK_ERROR: 'Network error. Check your connection.',
  SESSION_EXPIRED: 'Your session expired. Please sign in again.',

  // ── Forms ─────────────────────────────────────────────────────────────────
  REQUIRED_FIELD: (field) => `${field} is required.`,
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
  PASSWORD_MISMATCH: 'Passwords do not match.',

  // ── Projects ──────────────────────────────────────────────────────────────
  PROJECT_CREATED: 'Project created successfully.',
  PROJECT_UPDATED: 'Project updated.',
  PROJECT_DELETED: 'Project deleted.',
  PROJECT_ARCHIVED: 'Project archived.',

  // ── Tasks ─────────────────────────────────────────────────────────────────
  TASK_CREATED: 'Issue created.',
  TASK_UPDATED: 'Issue updated.',
  TASK_DELETED: 'Issue deleted.',
  TASK_MOVED: 'Issue moved.',

  // ── Sprints ───────────────────────────────────────────────────────────────
  SPRINT_STARTED: 'Sprint started.',
  SPRINT_COMPLETED: 'Sprint completed.',

  // ── Notifications ─────────────────────────────────────────────────────────
  NO_NOTIFICATIONS: 'No notifications yet.',
  MARK_ALL_READ: 'All notifications marked as read.',
});
