import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'model', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true },
);

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'New AI Conversation',
      trim: true,
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
    messages: [messageSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required.'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
conversationSchema.plugin(softDeletePlugin);
conversationSchema.plugin(paginationPlugin);
conversationSchema.plugin(auditPlugin);

conversationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

conversationSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
