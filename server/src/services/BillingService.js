import { SubscriptionRepository } from '../repositories/SubscriptionRepository.js';
import { InvoiceRepository } from '../repositories/InvoiceRepository.js';
import Member from '../models/Member.js';
import Organization from '../models/Organization.js';
import ActivityLog from '../models/ActivityLog.js';
import { ApiError } from '../utils/apiError.js';

const subscriptionRepo = new SubscriptionRepository();
const invoiceRepo = new InvoiceRepository();

// Plan limits definition
const PLAN_LIMITS = {
  free: {
    name: 'Free Tier',
    pricePerSeat: 0,
    seatLimit: 5,
    maxProjects: 3,
    aiTokenLimit: 10000,
    features: ['basic_kanban', 'up_to_5_members', 'basic_ai'],
  },
  pro: {
    name: 'Pro SaaS',
    pricePerSeat: 19,
    seatLimit: 25,
    maxProjects: 50,
    aiTokenLimit: 500000,
    features: ['unlimited_projects', 'sprints_burndown', 'ai_assistant', 'advanced_reports', 'export_csv'],
  },
  enterprise: {
    name: 'Enterprise Ultra',
    pricePerSeat: 49,
    seatLimit: 999,
    maxProjects: 9999,
    aiTokenLimit: 10000000,
    features: ['unlimited_everything', 'dedicated_ai', 'audit_logs', 'sso_saml', 'custom_domain', 'priority_support'],
  },
};

class BillingService {
  /** Get organization subscription details, seat count, and plan capabilities. */
  async getSubscriptionDetails(organizationId) {
    const subscription = await subscriptionRepo.findByOrganization(organizationId);

    // Calculate seats used
    const seatsUsed = await Member.countDocuments({ organizationId, status: 'active' });

    const planConfig = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;

    return {
      subscription,
      planConfig,
      usage: {
        seatsUsed,
        seatLimit: subscription.seatLimit || planConfig.seatLimit,
        seatPercentage: Math.round((seatsUsed / (subscription.seatLimit || planConfig.seatLimit)) * 100),
      },
    };
  }

  /** Update or Upgrade organization subscription plan. */
  async upgradePlan(organizationId, { plan, billingCycle = 'monthly', userId }) {
    if (!PLAN_LIMITS[plan]) {
      throw ApiError.badRequest(`Invalid plan: ${plan}`);
    }

    const config = PLAN_LIMITS[plan];
    const updatedSub = await subscriptionRepo.updatePlan(organizationId, {
      plan,
      billingCycle,
      status: 'active',
      seatLimit: config.seatLimit,
      pricePerSeat: config.pricePerSeat,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000),
    });

    // Also update Organization record
    await Organization.findByIdAndUpdate(organizationId, {
      subscriptionPlan: plan,
      subscriptionStatus: 'active',
    });

    // Generate Invoice
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const seatsUsed = await Member.countDocuments({ organizationId, status: 'active' });
    const amount = config.pricePerSeat * Math.max(1, seatsUsed);

    await invoiceRepo.create({
      organizationId,
      invoiceNumber,
      amount,
      currency: 'USD',
      status: 'paid',
      billingPeriodStart: updatedSub.currentPeriodStart,
      billingPeriodEnd: updatedSub.currentPeriodEnd,
      items: [
        {
          description: `Nexora.ai ${config.name} (${billingCycle}) - ${seatsUsed} Seats`,
          amount,
          quantity: seatsUsed,
        },
      ],
    });

    // Audit log
    await ActivityLog.create({
      organizationId,
      actorId: userId,
      action: 'SUBSCRIPTION_UPGRADED',
      entityType: 'Subscription',
      entityId: updatedSub._id,
      description: `Upgraded subscription to ${config.name} (${billingCycle})`,
    });

    return updatedSub;
  }

  /** Get billing invoice history for an organization. */
  async getInvoices(organizationId, options = {}) {
    return invoiceRepo.findByOrganization(organizationId, options);
  }

  /** Verify if organization has access to a feature based on subscription. */
  async checkFeatureAccess(organizationId, featureName) {
    const sub = await subscriptionRepo.findByOrganization(organizationId);
    const config = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.free;
    const hasAccess = config.features.includes(featureName) || sub.plan === 'enterprise';
    return { hasAccess, plan: sub.plan, requiredPlan: 'pro' };
  }
}

export default new BillingService();
