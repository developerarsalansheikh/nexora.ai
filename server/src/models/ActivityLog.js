import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const activityLogSchema = new mongoose.Schema(
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
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: [true, 'Workspace ID is required.'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required.'],
      trim: true,
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required.'],
      trim: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required.'],
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only log creation time
  },
);

// Apply reusable plugins
activityLogSchema.plugin(softDeletePlugin);
activityLogSchema.plugin(paginationPlugin);
activityLogSchema.plugin(auditPlugin);

activityLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

activityLogSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
