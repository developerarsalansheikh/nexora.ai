/**
 * Client-side application route paths.
 * Used with React Router v7 — never hardcode paths in components.
 */
export const APP_ROUTES = Object.freeze({
  // ── Public ────────────────────────────────────────────────────────────────
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // ── Workspace ─────────────────────────────────────────────────────────────
  WORKSPACE: '/workspace',
  WORKSPACE_SETTINGS: '/workspace/settings',

  // ── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: '/dashboard',

  // ── Projects ──────────────────────────────────────────────────────────────
  PROJECTS: '/projects',
  PROJECT_DETAIL: (id) => `/projects/${id}`,
  PROJECT_BOARD: (id) => `/projects/${id}/board`,
  PROJECT_SETTINGS: (id) => `/projects/${id}/settings`,

  // ── Tasks ─────────────────────────────────────────────────────────────────
  TASK_DETAIL: (projectId, taskId) => `/projects/${projectId}/tasks/${taskId}`,

  // ── Sprints ───────────────────────────────────────────────────────────────
  SPRINTS: (projectId) => `/projects/${projectId}/sprints`,

  // ── Settings ──────────────────────────────────────────────────────────────
  SETTINGS: '/settings',
  SETTINGS_PROFILE: '/settings/profile',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_BILLING: '/settings/billing',
  SETTINGS_INTEGRATIONS: '/settings/integrations',
});
