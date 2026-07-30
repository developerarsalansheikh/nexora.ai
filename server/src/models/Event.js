import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['event', 'milestone', 'deadline', 'sprint', 'personal'],
      default: 'event',
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required.'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required.'],
      index: true,
    },
    allDay: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: '#6366f1', // Default brand Indigo color
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
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator User ID is required.'],
      index: true,
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
eventSchema.plugin(softDeletePlugin);
eventSchema.plugin(paginationPlugin);
eventSchema.plugin(auditPlugin);

eventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

eventSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
