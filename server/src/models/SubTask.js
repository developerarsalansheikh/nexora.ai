import mongoose from 'mongoose';
import { TASK_STATUS, PRIORITY } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const subTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'SubTask title is required.'],
      trim: true,
    },
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Parent Task ID is required.'],
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required.'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.BACKLOG,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(PRIORITY),
      default: PRIORITY.NO_PRIORITY,
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Apply reusable plugins
subTaskSchema.plugin(softDeletePlugin);
subTaskSchema.plugin(paginationPlugin);
subTaskSchema.plugin(auditPlugin);

subTaskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

subTaskSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const SubTask = mongoose.model('SubTask', subTaskSchema);
export default SubTask;
