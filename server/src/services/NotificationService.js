import { NotificationRepository } from '../repositories/NotificationRepository.js';
import NotificationPreference from '../models/NotificationPreference.js';
import emailQueue from './EmailQueueService.js';
import { ApiError } from '../utils/apiError.js';

const notificationRepo = new NotificationRepository();

/**
 * NotificationService — handles in-app notifications and preferences.
 */
class NotificationService {
  /** Create an in-app notification and trigger email sending if user preferences allow. */
  async createNotification(payload) {
    const { recipientId, senderId, type, title, message, organizationId, workspaceId, taskId, projectId, linkUrl, metadata } = payload;

    // Check recipient preferences
    let pref = await NotificationPreference.findOne({ userId: recipientId }).lean();
    if (!pref) {
      pref = await NotificationPreference.create({ userId: recipientId });
    }

    // Check inApp preference for this type
    const inAppEnabled = pref.inApp?.[type] !== false;
    let notification = null;

    if (inAppEnabled) {
      notification = await notificationRepo.create({
        recipientId,
        senderId: senderId || null,
        type,
        title,
        message,
        organizationId,
        workspaceId: workspaceId || null,
        taskId: taskId || null,
        projectId: projectId || null,
        linkUrl: linkUrl || '',
        metadata: metadata || {},
      });
    }

    // Check email preference for this type and trigger async email
    const emailEnabled = pref.email?.[type] !== false;
    if (emailEnabled && payload.recipientEmail) {
      await emailQueue.sendEmail({
        to: payload.recipientEmail,
        subject: title,
        template: type,
        data: {
          name: payload.recipientName || 'Team Member',
          taskTitle: title,
          message,
          ...metadata,
        },
      });
    }

    return notification;
  }

  /** Get recipient notifications with pagination and status filter. */
  async getUserNotifications(recipientId, options = {}) {
    return notificationRepo.findByRecipient(recipientId, options);
  }

  /** Mark a single notification as read. */
  async markAsRead(notificationId, recipientId) {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) throw ApiError.notFound('Notification not found.');
    if (notification.recipientId.toString() !== recipientId.toString()) {
      throw ApiError.forbidden('Access denied.');
    }
    return notificationRepo.updateById(notificationId, { isRead: true, readAt: new Date() });
  }

  /** Mark all unread notifications as read. */
  async markAllAsRead(recipientId) {
    return notificationRepo.markAllAsRead(recipientId);
  }

  /** Archive a notification. */
  async archiveNotification(notificationId, recipientId) {
    return notificationRepo.archive(notificationId, recipientId);
  }

  /** Soft-delete a notification. */
  async deleteNotification(notificationId, recipientId) {
    const notification = await notificationRepo.findById(notificationId);
    if (!notification) throw ApiError.notFound('Notification not found.');
    if (notification.recipientId.toString() !== recipientId.toString()) {
      throw ApiError.forbidden('Access denied.');
    }
    return notificationRepo.deleteById(notificationId);
  }

  /** Get user notification preferences. */
  async getPreferences(userId) {
    let pref = await NotificationPreference.findOne({ userId }).lean();
    if (!pref) {
      pref = await NotificationPreference.create({ userId });
    }
    return pref;
  }

  /** Update user notification preferences. */
  async updatePreferences(userId, updateData) {
    return NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true },
    ).lean();
  }
}

export default new NotificationService();
