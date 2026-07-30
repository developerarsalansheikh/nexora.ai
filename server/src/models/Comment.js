import mongoose from 'mongoose';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required.'],
      trim: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required.'],
      index: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required.'],
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
commentSchema.plugin(softDeletePlugin);
commentSchema.plugin(paginationPlugin);
commentSchema.plugin(auditPlugin);

commentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

commentSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
