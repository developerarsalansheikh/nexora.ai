import billingService from '../services/BillingService.js';
import { ApiError } from '../utils/apiError.js';

/**
 * requireSubscriptionPlan middleware — enforces required subscription plan for routes.
 */
export const requireSubscriptionPlan = (requiredPlan = 'pro') => {
  return async (req, res, next) => {
    try {
      const orgId = req.params.orgId || req.user?.organizationId;
      if (!orgId) {
        return next(ApiError.badRequest('Organization ID required for subscription check.'));
      }

      const { plan } = await billingService.getSubscriptionDetails(orgId);

      const planHierarchy = { free: 1, pro: 2, enterprise: 3 };
      const currentLevel = planHierarchy[plan?.plan] || 1;
      const requiredLevel = planHierarchy[requiredPlan] || 2;

      if (currentLevel < requiredLevel) {
        return next(
          ApiError.forbidden(
            `This feature requires a ${requiredPlan.toUpperCase()} subscription plan. Please upgrade your plan in Organization Settings.`,
          ),
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
