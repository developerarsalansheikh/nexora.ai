import mongoose from 'mongoose';
import { VISIBILITY } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, slugPlugin, auditPlugin } from '../plugins/index.js';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required.'],
      trim: true,
      minlength: [2, 'Workspace name must be at least 2 characters.'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },
    description: {
      type: String,
      default: '',
    },
    visibility: {
      type: String,
      enum: Object.values(VISIBILITY),
      default: VISIBILITY.INTERNAL,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
workspaceSchema.plugin(softDeletePlugin);
workspaceSchema.plugin(paginationPlugin);
workspaceSchema.plugin(slugPlugin, { sourceField: 'name', slugField: 'slug' });
workspaceSchema.plugin(auditPlugin);

workspaceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

workspaceSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
