import mongoose from 'mongoose';
import { TASK_STATUS, PRIORITY } from '../constants/statuses.js';
import { softDeletePlugin, paginationPlugin, auditPlugin } from '../plugins/index.js';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
    },
    key: {
      type: String,
      required: [true, 'Task key is required.'],
      uppercase: true,
      trim: true,
      index: true,
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
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required.'],
      index: true,
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null,
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
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    type: {
      type: String,
      enum: ['story', 'task', 'bug', 'epic', 'improvement'],
      default: 'task',
      index: true,
    },
    watchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    labels: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Label',
      },
    ],
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required.'],
      index: true,
    },
    storyPoints: {
      type: Number,
      default: 0,
      min: [0, 'Story points cannot be negative.'],
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    loggedHours: {
      type: Number,
      default: 0,
    },
    workLogs: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        hours: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          default: '',
        },
        loggedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    parentTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    dependencies: [
      {
        taskId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Task',
        },
        type: {
          type: String,
          enum: ['blocks', 'blocked_by'],
          default: 'blocked_by',
        },
      },
    ],
    checklist: [
      {
        id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    recurring: {
      isRecurring: {
        type: Boolean,
        default: false,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
      },
      nextDueDate: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Ensure task key (e.g. POL-10) is unique within a project
taskSchema.index({ projectId: 1, key: 1 }, { unique: true });

// Apply reusable plugins
taskSchema.plugin(softDeletePlugin);
taskSchema.plugin(paginationPlugin);
taskSchema.plugin(auditPlugin);

taskSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
});

taskSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
