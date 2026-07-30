import mongoose from 'mongoose';
import { PROJECT_STATUS, VISIBILITY } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, slugPlugin, auditPlugin } from '../plugins/index.js';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required.'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters.'],
    },
    key: {
      type: String,
      required: [true, 'Project key is required.'],
      uppercase: true,
      trim: true,
      index: true,
      minlength: [2, 'Project key must be at least 2 characters.'],
      maxlength: [10, 'Project key cannot exceed 10 characters.'],
    },
    description: {
      type: String,
      default: '',
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
    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNING,
      index: true,
    },
    visibility: {
      type: String,
      enum: Object.values(VISIBILITY),
      default: VISIBILITY.INTERNAL,
      index: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    category: {
      type: String,
      default: 'Engineering',
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    health: {
      type: String,
      enum: ['healthy', 'at-risk', 'critical'],
      default: 'healthy',
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['lead', 'member', 'viewer'],
          default: 'member',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    settings: {
      defaultAssignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      allowPublicComments: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Ensure project key is unique inside a single workspace
projectSchema.index({ workspaceId: 1, key: 1 }, { unique: true });

// Apply reusable plugins
projectSchema.plugin(softDeletePlugin);
projectSchema.plugin(paginationPlugin);
projectSchema.plugin(slugPlugin, { sourceField: 'name', slugField: 'slug' });
projectSchema.plugin(auditPlugin);

projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

projectSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
