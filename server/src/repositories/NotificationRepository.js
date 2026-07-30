import { BaseRepository } from './BaseRepository.js';
import Notification from '../models/Notification.js';

export class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  /** Find notifications for a recipient with filters (unread, archived, category). */
  async findByRecipient(recipientId, options = {}) {
    const { page = 1, limit = 20, status = 'all', type } = options;
    const filter = { recipientId, deletedAt: null };

    if (status === 'unread') {
      filter.isRead = false;
      filter.isArchived = false;
    } else if (status === 'archived') {
      filter.isArchived = true;
    } else if (status === 'active') {
      filter.isArchived = false;
    }

    if (type) {
      filter.type = type;
    }

    const skip = (page - 1) * limit;

    const [data, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .populate('senderId', 'name email avatar')
        .populate('taskId', 'title status priority')
        .populate('projectId', 'name color')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipientId, isRead: false, isArchived: false, deletedAt: null }),
    ]);

    return {
      data,
      unreadCount,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Mark all unread notifications as read for a recipient. */
  async markAllAsRead(recipientId) {
    return Notification.updateMany(
      { recipientId, isRead: false, deletedAt: null },
      { $set: { isRead: true, readAt: new Date() } },
    );
  }

  /** Archive a specific notification. */
  async archive(notificationId, recipientId) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipientId },
      { $set: { isArchived: true } },
      { new: true },
    ).lean();
  }
}

export default NotificationRepository;
