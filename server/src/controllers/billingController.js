import billingService from '../services/BillingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getSubscription = asyncHandler(async (req, res) => {
  const details = await billingService.getSubscriptionDetails(req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Subscription details retrieved.', details));
});

export const upgradePlan = asyncHandler(async (req, res) => {
  const { plan, billingCycle } = req.body;
  if (!plan) return res.status(400).json(new ApiResponse(400, 'Plan is required.'));

  const subscription = await billingService.upgradePlan(req.params.orgId, {
    plan,
    billingCycle,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, `Successfully upgraded to ${plan} plan.`, { subscription }));
});

export const getInvoices = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await billingService.getInvoices(req.params.orgId, { page, limit });
  res.status(200).json(new ApiResponse(200, 'Invoices retrieved.', { docs: result.data, meta: result.meta }));
});

export const checkFeature = asyncHandler(async (req, res) => {
  const { feature } = req.query;
  const access = await billingService.checkFeatureAccess(req.params.orgId, feature);
  res.status(200).json(new ApiResponse(200, 'Feature access checked.', access));
});
