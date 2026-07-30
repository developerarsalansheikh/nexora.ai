import { BaseRepository } from './BaseRepository.js';
import Subscription from '../models/Subscription.js';

export class SubscriptionRepository extends BaseRepository {
  constructor() {
    super(Subscription);
  }

  /** Find subscription by organization ID or auto-create FREE plan default. */
  async findByOrganization(organizationId) {
    let sub = await Subscription.findOne({ organizationId, deletedAt: null }).lean();
    if (!sub) {
      const created = await Subscription.create({
        organizationId,
        plan: 'free',
        status: 'active',
        seatLimit: 5,
        pricePerSeat: 0,
      });
      sub = created.toObject();
    }
    return sub;
  }

  /** Update subscription plan details. */
  async updatePlan(organizationId, planData) {
    return Subscription.findOneAndUpdate(
      { organizationId },
      { $set: planData },
      { new: true, upsert: true },
    ).lean();
  }
}

export default SubscriptionRepository;
