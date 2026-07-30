import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import Organization from '../models/Organization.js';

/**
 * Middleware to validate that the organization exists and is active.
 * Checks organization ID from headers, query, or body.
 */
export const validateOrganization = asyncHandler(async (req, res, next) => {
  const organizationId =
    req.headers['x-organization-id'] ||
    req.headers['x-org-id'] ||
    req.query.organizationId ||
    req.query.orgId ||
    req.body.organizationId;

  if (!organizationId) {
    next(
      ApiError.badRequest(
        'Organization context (ID) is required. Please provide it via headers (x-organization-id), query, or body.',
      ),
    );
    return;
  }

  // Validate ObjectId structure
  if (!/^[a-f\d]{24}$/i.test(organizationId)) {
    next(ApiError.badRequest('Invalid organization ID format.'));
    return;
  }

  const organization = await Organization.findOne({
    _id: organizationId,
    isDeleted: { $ne: true },
  });

  if (!organization) {
    next(ApiError.notFound('Organization not found or has been deactivated.'));
    return;
  }

  req.organizationId = organizationId;
  req.organization = organization;
  next();
});

export default validateOrganization;
