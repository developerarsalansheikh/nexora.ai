import { ApiError } from '../utils/apiError.js';

// Permission matrix mapping roles to granular permission tokens
export const ROLE_PERMISSIONS = {
  owner: [
    'workspace:create',
    'workspace:read',
    'workspace:update',
    'workspace:delete',
    'workspace:manage_members',
    'workspace:manage_billing',
    'project:create',
    'project:read',
    'project:update',
    'project:delete',
    'project:manage_members',
    'project:archive',
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'task:assign',
    'task:change_status',
    'task:comment',
    'sprint:create',
    'sprint:start',
    'sprint:complete',
    'sprint:delete',
    'admin:all',
  ],
  admin: [
    'workspace:read',
    'workspace:update',
    'workspace:manage_members',
    'project:create',
    'project:read',
    'project:update',
    'project:manage_members',
    'project:archive',
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'task:assign',
    'task:change_status',
    'task:comment',
    'sprint:create',
    'sprint:start',
    'sprint:complete',
  ],
  project_manager: [
    'workspace:read',
    'project:read',
    'project:update',
    'project:manage_members',
    'task:create',
    'task:read',
    'task:update',
    'task:delete',
    'task:assign',
    'task:change_status',
    'task:comment',
    'sprint:create',
    'sprint:start',
    'sprint:complete',
  ],
  team_lead: [
    'workspace:read',
    'project:read',
    'task:create',
    'task:read',
    'task:update',
    'task:assign',
    'task:change_status',
    'task:comment',
    'sprint:create',
    'sprint:start',
  ],
  developer: [
    'workspace:read',
    'project:read',
    'task:create',
    'task:read',
    'task:update',
    'task:assign',
    'task:change_status',
    'task:comment',
  ],
  qa: [
    'workspace:read',
    'project:read',
    'task:create',
    'task:read',
    'task:update',
    'task:change_status',
    'task:comment',
  ],
  viewer: ['workspace:read', 'project:read', 'task:read'],
};

/**
 * authorizeRoles middleware
 * Restricts access to users holding one of the specified roles within the organization context.
 *
 * @param {...string} allowedRoles
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.membership) {
      next(ApiError.unauthorized('Access denied. Membership context missing.'));
      return;
    }

    const userRole = req.orgRole || req.membership.role;

    if (!allowedRoles.includes(userRole)) {
      next(
        ApiError.forbidden(
          `Access denied. Role '${userRole}' is not authorized to perform this action.`,
        ),
      );
      return;
    }

    next();
  };
};

/**
 * authorizePermissions middleware
 * Restricts access based on permissions. Resolves user's role to check if they have all required permissions.
 *
 * @param {...string} requiredPermissions
 */
export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.membership) {
      next(ApiError.unauthorized('Access denied. Membership context missing.'));
      return;
    }

    const userRole = req.orgRole || req.membership.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    // Owner has superadmin capabilities
    if (permissions.includes('admin:all')) {
      next();
      return;
    }

    const hasAllPermissions = requiredPermissions.every((p) => permissions.includes(p));

    if (!hasAllPermissions) {
      next(
        ApiError.forbidden(
          'Access denied. You do not have sufficient permissions to perform this action.',
        ),
      );
      return;
    }

    next();
  };
};
