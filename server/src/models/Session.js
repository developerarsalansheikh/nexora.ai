import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin } from '../plugins/index.js';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required.'],
      unique: true,
    },
    device: {
      type: String,
      default: 'Unknown',
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
    },
    isValid: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required.'],
      index: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Apply plugins
sessionSchema.plugin(softDeletePlugin);
sessionSchema.plugin(paginationPlugin);

sessionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

sessionSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
