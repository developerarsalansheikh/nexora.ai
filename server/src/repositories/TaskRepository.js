import { BaseRepository } from './BaseRepository.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

export class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  /**
   * Find all tasks in a project with search, filters, sorting, and pagination.
   */
  async findByProject(projectId, options = {}) {
    const {
      search = '',
      status,
      priority,
      type,
      assignee,
      reporter,
      sprintId,
      parentTaskId = null,
      isArchived = false,
      sort = 'order createdAt',
      page = 1,
      limit = 50,
    } = options;

    const query = {
      projectId,
      deletedAt: null,
    };

    if (parentTaskId !== undefined) {
      query.parentTaskId = parentTaskId === 'all' ? { $exists: true } : parentTaskId;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (type) {
      query.type = type;
    }

    if (assignee) {
      query.$or = [{ assignee }, { assignees: assignee }];
    }

    if (reporter) {
      query.reporter = reporter;
    }

    if (sprintId) {
      query.sprintId = sprintId;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { key: searchRegex },
        { description: searchRegex },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    const [tasks, totalDocs] = await Promise.all([
      Task.find(query)
        .populate('assignee', 'name email avatar')
        .populate('assignees', 'name email avatar')
        .populate('reporter', 'name email avatar')
        .populate('watchers', 'name email avatar')
        .populate('labels', 'name color')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean({ virtuals: true }),
      Task.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limitNum) || 1;

    return {
      docs: tasks,
      totalDocs,
      limit: limitNum,
      page: parseInt(page, 10),
      totalPages,
      hasNextPage: parseInt(page, 10) < totalPages,
      hasPrevPage: parseInt(page, 10) > 1,
    };
  }

  /**
   * Find single task by ID with full populated associations.
   */
  async findByIdPopulated(taskId) {
    return Task.findOne({ _id: taskId, deletedAt: null })
      .populate('assignee', 'name email avatar')
      .populate('assignees', 'name email avatar')
      .populate('reporter', 'name email avatar')
      .populate('watchers', 'name email avatar')
      .populate('followers', 'name email avatar')
      .populate('labels', 'name color')
      .populate('dependencies.taskId', 'key title status priority')
      .populate('parentTaskId', 'key title status')
      .populate('workLogs.userId', 'name email avatar')
      .lean({ virtuals: true });
  }

  /**
   * Generate next sequential Task Key for a project (e.g. POL-1, POL-2).
   */
  async generateNextTaskKey(projectId) {
    const project = await Project.findById(projectId);
    const projectKey = project ? project.key : 'TASK';

    const latestTask = await Task.findOne({ projectId })
      .sort({ createdAt: -1 })
      .select('key')
      .lean();

    let nextNum = 1;
    if (latestTask && latestTask.key) {
      const parts = latestTask.key.split('-');
      if (parts.length > 1) {
        const parsed = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(parsed)) {
          nextNum = parsed + 1;
        }
      }
    }

    return `${projectKey}-${nextNum}`;
  }

  /**
   * Bulk reorder / move tasks across status columns (Kanban DnD persistence).
   * @param {Array<{ taskId: string, status: string, order: number }>} items
   */
  async reorderTasks(items) {
    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.taskId },
        update: {
          $set: {
            status: item.status,
            order: item.order,
          },
        },
      },
    }));

    if (bulkOps.length === 0) return true;
    await Task.bulkWrite(bulkOps);
    return true;
  }

  /**
   * Add work log entry to task time tracking.
   */
  async addWorkLog(taskId, userId, hours, comment) {
    const task = await Task.findById(taskId);
    if (!task) return null;

    task.workLogs.push({ userId, hours, comment, loggedAt: new Date() });
    task.loggedHours = (task.loggedHours || 0) + hours;
    await task.save();

    return this.findByIdPopulated(taskId);
  }

  /**
   * Toggle task watcher.
   */
  async toggleWatcher(taskId, userId) {
    const task = await Task.findById(taskId);
    if (!task) return null;

    const index = task.watchers.indexOf(userId);
    let isWatching = false;

    if (index > -1) {
      task.watchers.splice(index, 1);
      isWatching = false;
    } else {
      task.watchers.push(userId);
      isWatching = true;
    }

    await task.save();
    return { task, isWatching };
  }

  /**
   * Checklist item toggle.
   */
  async toggleChecklistItem(taskId, itemId, completed) {
    return Task.findOneAndUpdate(
      { _id: taskId, 'checklist.id': itemId },
      { $set: { 'checklist.$.completed': completed } },
      { new: true },
    ).lean({ virtuals: true });
  }

  /**
   * Add checklist item.
   */
  async addChecklistItem(taskId, item) {
    return Task.findByIdAndUpdate(
      taskId,
      { $push: { checklist: item } },
      { new: true },
    ).lean({ virtuals: true });
  }

  /**
   * Remove checklist item.
   */
  async removeChecklistItem(taskId, itemId) {
    return Task.findByIdAndUpdate(
      taskId,
      { $pull: { checklist: { id: itemId } } },
      { new: true },
    ).lean({ virtuals: true });
  }

  /**
   * Add dependency link.
   */
  async addDependency(taskId, targetTaskId, type = 'blocked_by') {
    return Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { dependencies: { taskId: targetTaskId, type } } },
      { new: true },
    ).lean({ virtuals: true });
  }

  /**
   * Remove dependency link.
   */
  async removeDependency(taskId, targetTaskId) {
    return Task.findByIdAndUpdate(
      taskId,
      { $pull: { dependencies: { taskId: targetTaskId } } },
      { new: true },
    ).lean({ virtuals: true });
  }
}

export default TaskRepository;
