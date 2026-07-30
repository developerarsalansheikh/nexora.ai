import mongoose from 'mongoose';

const notificationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    inApp: {
      task_assigned: { type: Boolean, default: true },
      task_mentioned: { type: Boolean, default: true },
      task_updated: { type: Boolean, default: true },
      due_date_reminder: { type: Boolean, default: true },
      sprint_updates: { type: Boolean, default: true },
      project_updates: { type: Boolean, default: true },
      workspace_announcements: { type: Boolean, default: true },
    },
    email: {
      welcome: { type: Boolean, default: true },
      task_assigned: { type: Boolean, default: true },
      sprint_started: { type: Boolean, default: true },
      sprint_completed: { type: Boolean, default: true },
      daily_digest: { type: Boolean, default: true },
      weekly_summary: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  },
);

notificationPreferenceSchema.set('toJSON', { virtuals: true, versionKey: false });
notificationPreferenceSchema.set('toObject', { virtuals: true, versionKey: false });

const NotificationPreference = mongoose.model('NotificationPreference', notificationPreferenceSchema);
export default NotificationPreference;
