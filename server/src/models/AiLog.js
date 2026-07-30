import mongoose from 'mongoose';

const aiLogSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'chat',
        'generate_description',
        'improve_criteria',
        'generate_subtasks',
        'estimate_points',
        'detect_blockers',
        'recommend_assignee',
        'suggest_sprint_goal',
        'predict_sprint_risk',
        'generate_retro_summary',
        'project_health_report',
        'standup_summary',
        'generate_release_notes',
        'generate_meeting_notes',
        'smart_search',
      ],
      required: true,
      index: true,
    },
    modelUsed: {
      type: String,
      default: 'gemini-2.5-flash',
    },
    promptTokens: {
      type: Number,
      default: 0,
    },
    completionTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'fallback'],
      default: 'success',
    },
    error: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

aiLogSchema.set('toJSON', { virtuals: true, versionKey: false });
aiLogSchema.set('toObject', { virtuals: true, versionKey: false });

const AiLog = mongoose.model('AiLog', aiLogSchema);
export default AiLog;
