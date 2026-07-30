import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required.'],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, 'Notification type is required.'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Notification title is required.'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Notification message is required.'],
      trim: true,
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
      default: null,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    isRead: {
      type: Boolean,
      required: true,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    linkUrl: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
notificationSchema.plugin(softDeletePlugin);
notificationSchema.plugin(paginationPlugin);
notificationSchema.plugin(auditPlugin);

notificationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

notificationSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
