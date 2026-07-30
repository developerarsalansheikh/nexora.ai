import { BaseService } from './BaseService.js';
import { EventRepository } from '../repositories/EventRepository.js';
import Task from '../models/Task.js';
import Sprint from '../models/Sprint.js';
import ActivityLog from '../models/ActivityLog.js';
import { ApiError } from '../utils/apiError.js';

const eventRepo = new EventRepository();

export class EventService extends BaseService {
  constructor() {
    super(eventRepo);
  }

  /**
   * Helper to log activity entries for event actions.
   */
  async logActivity(userId, organizationId, workspaceId, action, eventId, metadata = {}) {
    try {
      await ActivityLog.create({
        userId,
        organizationId,
        workspaceId,
        action,
        entityType: 'Event',
        entityId: eventId,
        metadata,
      });
    } catch (err) {
      console.error('Failed to log event activity:', err.message);
    }
  }

  /**
   * Create a calendar event or milestone.
   */
  async create(data, workspaceId, organizationId, userId) {
    const event = await eventRepo.create({
      ...data,
      workspaceId,
      organizationId,
      createdBy: userId,
    });

    await this.logActivity(userId, organizationId, workspaceId, 'event.created', event._id, {
      title: event.title,
      type: event.type,
    });

    return event;
  }

  /**
   * Get unified calendar events for a workspace within a date range.
   * Merges custom events, milestones, task deadlines, and sprint dates.
   */
  async getUnifiedCalendarEvents(workspaceId, startDate, endDate, options = {}) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Fetch custom events & milestones from Event repository
    const customEvents = await eventRepo.findByRange(workspaceId, startDate, endDate, options);

    // 2. Fetch task deadlines within range
    const taskQuery = {
      workspaceId,
      deletedAt: null,
      dueDate: { $gte: start, $lte: end },
    };
    if (options.projectId) {
      taskQuery.projectId = options.projectId;
    }

    const tasks = await Task.find(taskQuery)
      .populate('assignee', 'name email avatar')
      .lean();

    const taskEvents = tasks.map((t) => ({
      _id: `task_${t._id}`,
      taskId: t._id,
      title: `[${t.key}] ${t.title}`,
      description: t.description || '',
      type: 'deadline',
      startDate: t.dueDate,
      endDate: t.dueDate,
      allDay: true,
      color: t.priority === 'urgent' ? '#f43f5e' : t.priority === 'high' ? '#f97316' : '#6366f1',
      status: t.status,
      priority: t.priority,
      assignee: t.assignee,
      isTaskDeadline: true,
    }));

    // 3. Fetch sprint dates within range
    const sprintQuery = {
      workspaceId,
      deletedAt: null,
      $or: [
        { startDate: { $gte: start, $lte: end } },
        { endDate: { $gte: start, $lte: end } },
      ],
    };
    if (options.projectId) {
      sprintQuery.projectId = options.projectId;
    }

    const sprints = await Sprint.find(sprintQuery).lean();

    const sprintEvents = sprints.map((s) => ({
      _id: `sprint_${s._id}`,
      sprintId: s._id,
      title: `🏃 Sprint: ${s.name}`,
      description: s.goal || '',
      type: 'sprint',
      startDate: s.startDate || start,
      endDate: s.endDate || end,
      allDay: true,
      color: s.status === 'active' ? '#10b981' : '#8b5cf6',
      status: s.status,
      isSprintRange: true,
    }));

    return [...customEvents, ...taskEvents, ...sprintEvents];
  }

  /**
   * Get single event by ID.
   */
  async getById(eventId, organizationId) {
    const event = await eventRepo.findOne({
      _id: eventId,
      organizationId,
      deletedAt: null,
    });
    if (!event) {
      throw ApiError.notFound('Event not found.');
    }
    return event;
  }

  /**
   * Update calendar event.
   */
  async update(eventId, organizationId, workspaceId, data, userId) {
    await this.getById(eventId, organizationId);
    const updated = await eventRepo.updateById(eventId, data);

    await this.logActivity(userId, organizationId, workspaceId, 'event.updated', eventId);

    return updated;
  }

  /**
   * Delete calendar event.
   */
  async delete(eventId, organizationId, workspaceId, userId) {
    await this.getById(eventId, organizationId);
    const result = await eventRepo.deleteById(eventId);

    await this.logActivity(userId, organizationId, workspaceId, 'event.deleted', eventId);

    return result;
  }
}

export default EventService;
