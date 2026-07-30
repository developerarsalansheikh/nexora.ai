import mongoose from 'mongoose';
import { WORKSPACE_ROLES } from '../constants/roles.js';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const memberSchema = new mongoose.Schema(
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
      default: null,
      index: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'guest', 'project_manager', 'team_lead', 'developer', 'qa', 'viewer'],
      default: 'member',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'suspended'],
      default: 'invited',
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Composite unique index to prevent duplicate memberships per org
memberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });


// Apply reusable plugins
memberSchema.plugin(softDeletePlugin);
memberSchema.plugin(paginationPlugin);
memberSchema.plugin(auditPlugin);

memberSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

memberSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Member = mongoose.model('Member', memberSchema);
export default Member;
