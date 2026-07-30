import mongoose from 'mongoose';
import { SPRINT_STATUS } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const sprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sprint name is required.'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    goal: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
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
      required: [true, 'Project ID is required.'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SPRINT_STATUS),
      default: SPRINT_STATUS.DRAFT,
      index: true,
    },
    capacity: {
      totalHours: {
        type: Number,
        default: 0,
      },
      memberCapacities: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          hours: {
            type: Number,
            default: 0,
          },
        },
      ],
    },
    velocity: {
      plannedPoints: {
        type: Number,
        default: 0,
      },
      completedPoints: {
        type: Number,
        default: 0,
      },
    },
    burndown: [
      {
        date: {
          type: Date,
          required: true,
        },
        remainingPoints: {
          type: Number,
          required: true,
        },
        idealPoints: {
          type: Number,
          required: true,
        },
      },
    ],
    retrospective: {
      summary: {
        type: String,
        default: '',
      },
      wentWell: [
        {
          type: String,
        },
      ],
      needsImprovement: [
        {
          type: String,
        },
      ],
      actionItems: [
        {
          type: String,
        },
      ],
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
sprintSchema.plugin(softDeletePlugin);
sprintSchema.plugin(paginationPlugin);
sprintSchema.plugin(auditPlugin);

sprintSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

sprintSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Sprint = mongoose.model('Sprint', sprintSchema);
export default Sprint;
