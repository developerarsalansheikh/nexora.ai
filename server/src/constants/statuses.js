/**
 * Task lifecycle status constants.
 */
export const TASK_STATUS = Object.freeze({
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
  DUPLICATE: 'duplicate',
});

/**
 * Sprint lifecycle status constants.
 */
export const SPRINT_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
});

/**
 * Project lifecycle status constants.
 */
export const PROJECT_STATUS = Object.freeze({
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
  CANCELLED: 'cancelled',
});

/**
 * Task / Issue priority levels.
 */
export const PRIORITY = Object.freeze({
  NO_PRIORITY: 'no_priority',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

/**
 * Notification event type identifiers.
 */
export const NOTIFICATION_TYPES = Object.freeze({
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_COMMENTED: 'task_commented',
  TASK_MENTIONED: 'task_mentioned',
  SPRINT_STARTED: 'sprint_started',
  SPRINT_COMPLETED: 'sprint_completed',
  PROJECT_INVITED: 'project_invited',
  WORKSPACE_INVITED: 'workspace_invited',
  DEADLINE_APPROACHING: 'deadline_approaching',
});

/**
 * Subscription plan enums.
 */
export const SUBSCRIPTION_PLANS = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
});

/**
 * Visibility options.
 */
export const VISIBILITY = Object.freeze({
  PUBLIC: 'public',
  PRIVATE: 'private',
  INTERNAL: 'internal',
});
