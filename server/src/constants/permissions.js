/**
 * Granular permission constants for Nexora.ai RBAC system.
 * These are checked at the middleware layer before controller execution.
 */
export const PERMISSIONS = Object.freeze({
  // ── Workspace Permissions ──────────────────────────────────────────────────
  WORKSPACE_CREATE: 'workspace:create',
  WORKSPACE_READ: 'workspace:read',
  WORKSPACE_UPDATE: 'workspace:update',
  WORKSPACE_DELETE: 'workspace:delete',
  WORKSPACE_MANAGE_MEMBERS: 'workspace:manage_members',
  WORKSPACE_MANAGE_BILLING: 'workspace:manage_billing',

  // ── Project Permissions ───────────────────────────────────────────────────
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',
  PROJECT_MANAGE_MEMBERS: 'project:manage_members',
  PROJECT_ARCHIVE: 'project:archive',

  // ── Task Permissions ──────────────────────────────────────────────────────
  TASK_CREATE: 'task:create',
  TASK_READ: 'task:read',
  TASK_UPDATE: 'task:update',
  TASK_DELETE: 'task:delete',
  TASK_ASSIGN: 'task:assign',
  TASK_CHANGE_STATUS: 'task:change_status',
  TASK_COMMENT: 'task:comment',

  // ── Sprint Permissions ────────────────────────────────────────────────────
  SPRINT_CREATE: 'sprint:create',
  SPRINT_START: 'sprint:start',
  SPRINT_COMPLETE: 'sprint:complete',
  SPRINT_DELETE: 'sprint:delete',

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN_ALL: 'admin:all',
});
