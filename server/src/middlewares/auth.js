import { authenticateUser } from './authenticateUser.js';
import { authorizeRoles } from './authorizeRoles.js';

/**
 * Backward-compatibility wrapper for routes importing 'protect'
 * Maps directly to authenticateUser.
 */
export const protect = authenticateUser;

/**
 * Backward-compatibility wrapper for routes importing 'requireRole'
 * Maps directly to authorizeRoles.
 */
export const requireRole = authorizeRoles;
