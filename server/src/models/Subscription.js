import mongoose from 'mongoose';
import { SUBSCRIPTION_PLANS } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const subscriptionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      unique: true,
      index: true,
    },
    plan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      default: SUBSCRIPTION_PLANS.FREE,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      default: 'active',
      index: true,
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    seatLimit: {
      type: Number,
      default: 5, // Free tier: 5 seats limit
    },
    pricePerSeat: {
      type: Number,
      default: 0, // Free: $0, Pro: $19, Enterprise: $49
    },
    stripeCustomerId: {
      type: String,
      default: '',
    },
    stripeSubscriptionId: {
      type: String,
      default: '',
    },
    currentPeriodStart: {
      type: Date,
      default: Date.now,
    },
    currentPeriodEnd: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

subscriptionSchema.plugin(softDeletePlugin);
subscriptionSchema.plugin(paginationPlugin);
subscriptionSchema.plugin(auditPlugin);

subscriptionSchema.set('toJSON', { virtuals: true, versionKey: false });
subscriptionSchema.set('toObject', { virtuals: true, versionKey: false });

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;
