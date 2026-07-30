/**
 * User roles across the Nexora.ai workspace system.
 * Used for RBAC (Role-Based Access Control) at organization, project, and workspace level.
 */
export const USER_ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin', // Platform-level administrator
  ADMIN: 'admin', // Organization administrator
  MEMBER: 'member', // Standard workspace member
  GUEST: 'guest', // Read-only external collaborator
});

export const WORKSPACE_ROLES = Object.freeze({
  OWNER: 'owner', // Workspace creator — full control
  ADMIN: 'admin', // Can manage settings and members
  PROJECT_MANAGER: 'project_manager', // Can manage projects and sprints
  TEAM_LEAD: 'team_lead', // Can manage team tasks
  DEVELOPER: 'developer', // Standard contributor
  QA: 'qa', // Quality assurance and testing
  VIEWER: 'viewer', // Read-only access
});

export const PROJECT_ROLES = Object.freeze({
  LEAD: 'lead', // Project lead — manages milestones
  CONTRIBUTOR: 'contributor', // Active task contributor
  REVIEWER: 'reviewer', // Code / task reviewer
  OBSERVER: 'observer', // View-only project access
});
