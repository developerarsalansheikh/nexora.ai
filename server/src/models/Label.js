import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const labelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Label name is required.'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Color code is required.'],
      trim: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code.'],
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
  },
  {
    timestamps: true,
  },
);

// Ensure label name is unique within a single workspace
labelSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

// Apply reusable plugins
labelSchema.plugin(softDeletePlugin);
labelSchema.plugin(paginationPlugin);
labelSchema.plugin(auditPlugin);

labelSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

labelSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Label = mongoose.model('Label', labelSchema);
export default Label;
