import mongoose from 'mongoose';
import { SUBSCRIPTION_PLANS } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, slugPlugin, auditPlugin } from '../plugins/index.js';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required.'],
      trim: true,
      minlength: [2, 'Organization name must be at least 2 characters.'],
    },
    logo: {
      type: String,
      default: '',
    },
    subscriptionPlan: {
      type: String,
      enum: Object.values(SUBSCRIPTION_PLANS),
      default: SUBSCRIPTION_PLANS.FREE,
      index: true,
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'trialing'],
      default: 'trialing',
      index: true,
    },
    billingEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid billing email address.',
      ],
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
organizationSchema.plugin(softDeletePlugin);
organizationSchema.plugin(paginationPlugin);
organizationSchema.plugin(slugPlugin, { sourceField: 'name', slugField: 'slug' });
organizationSchema.plugin(auditPlugin);

organizationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

organizationSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Organization = mongoose.model('Organization', organizationSchema);
export default Organization;
