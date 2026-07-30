import { ApiError } from '../utils/apiError.js';
import Member from '../models/Member.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * requireMembership — verifies that the authenticated user is
 * an active member of the organization referenced in `req.params.orgId`.
 *
 * Attaches `req.membership` for downstream role checks.
 * Must be used AFTER `protect`.
 */
export const requireMembership = asyncHandler(async (req, res, next) => {
  const organizationId = req.params.orgId;

  if (!organizationId) {
    throw ApiError.badRequest('Organization context is required.');
  }

  const membership = await Member.findOne({
    userId: req.user._id,
    organizationId,
    status: 'active',
    deletedAt: null,
  });

  if (!membership) {
    throw ApiError.forbidden('You are not a member of this organization.');
  }

  req.membership = membership;
  req.organizationId = organizationId;
  next();
});

/**
 * requireOrgRole — verifies the member has one of the required roles
 * within the current organization.
 *
 * @param {...string} roles - Allowed org-level roles (e.g. 'owner', 'admin')
 * Must be used AFTER `requireMembership`.
 */
export const requireOrgRole = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!req.membership) {
      throw ApiError.unauthorized('Membership context missing. Use requireMembership first.');
    }
    if (!roles.includes(req.membership.role)) {
      throw ApiError.forbidden(
        `Organization role '${req.membership.role}' cannot perform this action.`,
      );
    }
    next();
  });
