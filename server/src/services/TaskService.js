import { BaseService } from './BaseService.js';
import { TaskRepository } from '../repositories/TaskRepository.js';
import { SubTaskRepository } from '../repositories/SubTaskRepository.js';
import ActivityLog from '../models/ActivityLog.js';
import Task from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';

const taskRepo = new TaskRepository();
const subTaskRepo = new SubTaskRepository();

export class TaskService extends BaseService {
  constructor() {
    super(taskRepo);
  }

  /**
   * Helper to log activity entries for task events.
   */
  async logActivity(userId, organizationId, workspaceId, action, taskId, metadata = {}) {
    try {
      await ActivityLog.create({
        userId,
        organizationId,
        workspaceId,
        action,
        entityType: 'Task',
        entityId: taskId,
        metadata,
      });
    } catch (err) {
      console.error('Failed to log task activity:', err.message);
    }
  }

  /**
   * Cyclic Dependency Checker algorithm using Breadth-First Search (BFS).
   * Checks if targetTaskId can reach startTaskId through existing dependency chains.
   */
  async hasCyclicDependency(startTaskId, targetTaskId) {
    if (startTaskId.toString() === targetTaskId.toString()) {
      return true;
    }

    const visited = new Set();
    const queue = [targetTaskId.toString()];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (currentId === startTaskId.toString()) {
        return true;
      }

      if (!visited.has(currentId)) {
        visited.add(currentId);

        const currentTask = await Task.findById(currentId).lean();
        if (currentTask && currentTask.dependencies && currentTask.dependencies.length > 0) {
          for (const dep of currentTask.dependencies) {
            if (dep.taskId) {
              queue.push(dep.taskId.toString());
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Create a new task within a project.
   */
  async create(data, projectId, workspaceId, organizationId, userId) {
    const key = await taskRepo.generateNextTaskKey(projectId);

    const taskData = {
      ...data,
      key,
      projectId,
      workspaceId,
      organizationId,
      reporter: userId,
      createdBy: userId,
    };

    const task = await taskRepo.create(taskData);

    await this.logActivity(userId, organizationId, workspaceId, 'task.created', task._id, {
      title: task.title,
      key: task.key,
      status: task.status,
      priority: task.priority,
      type: task.type,
    });

    return taskRepo.findByIdPopulated(task._id);
  }

  /**
   * List tasks in a project with search, filters, sorting, and pagination.
   */
  async listByProject(projectId, options = {}) {
    return taskRepo.findByProject(projectId, options);
  }

  /**
   * List tasks in a sprint.
   */
  async listBySprint(sprintId, options = {}) {
    return taskRepo.findBySprint(sprintId, options);
  }

  /**
   * Get single task details by ID with populated references.
   */
  async getById(taskId, organizationId) {
    const task = await taskRepo.findByIdPopulated(taskId);
    if (!task) {
      throw ApiError.notFound('Task not found.');
    }
    if (
      task.organizationId._id
        ? task.organizationId._id.toString() !== organizationId.toString()
        : task.organizationId.toString() !== organizationId.toString()
    ) {
      throw ApiError.notFound('Task not found in this organization.');
    }
    return task;
  }

  /**
   * Update task metadata.
   */
  async update(taskId, organizationId, workspaceId, data, userId) {
    await this.getById(taskId, organizationId);

    const updated = await taskRepo.updateById(taskId, data);

    await this.logActivity(userId, organizationId, workspaceId, 'task.updated', taskId, {
      updatedFields: Object.keys(data),
    });

    return taskRepo.findByIdPopulated(taskId);
  }

  /**
   * Reorder / Bulk move tasks across Kanban columns.
   */
  async reorderTasks(projectId, organizationId, workspaceId, items, userId) {
    await taskRepo.reorderTasks(items);

    await this.logActivity(userId, organizationId, workspaceId, 'task.kanban_reordered', projectId, {
      movedCount: items.length,
    });

    return true;
  }

  /**
   * Add time tracking work log.
   */
  async addWorkLog(taskId, organizationId, workspaceId, userId, hours, comment) {
    await this.getById(taskId, organizationId);

    const updated = await taskRepo.addWorkLog(taskId, userId, hours, comment);

    await this.logActivity(userId, organizationId, workspaceId, 'task.worklog_added', taskId, {
      hours,
      comment,
    });

    return updated;
  }

  /**
   * Toggle task watcher.
   */
  async toggleWatcher(taskId, organizationId, workspaceId, userId) {
    await this.getById(taskId, organizationId);

    const result = await taskRepo.toggleWatcher(taskId, userId);

    await this.logActivity(
      userId,
      organizationId,
      workspaceId,
      result.isWatching ? 'task.watched' : 'task.unwatched',
      taskId,
    );

    return result;
  }

  /**
   * Add dependency link with Cyclic Dependency Prevention.
   */
  async addDependency(taskId, organizationId, workspaceId, targetTaskId, type, userId) {
    await this.getById(taskId, organizationId);

    const isCyclic = await this.hasCyclicDependency(taskId, targetTaskId);
    if (isCyclic) {
      throw ApiError.badRequest('Cyclic dependency detected! Target task already depends on this task.');
    }

    const updated = await taskRepo.addDependency(taskId, targetTaskId, type);

    await this.logActivity(userId, organizationId, workspaceId, 'task.dependency_added', taskId, {
      targetTaskId,
      type,
    });

    return taskRepo.findByIdPopulated(taskId);
  }

  /**
   * Remove dependency link.
   */
  async removeDependency(taskId, organizationId, workspaceId, targetTaskId, userId) {
    await this.getById(taskId, organizationId);

    const updated = await taskRepo.removeDependency(taskId, targetTaskId);

    await this.logActivity(userId, organizationId, workspaceId, 'task.dependency_removed', taskId, {
      targetTaskId,
    });

    return taskRepo.findByIdPopulated(taskId);
  }

  /**
   * Toggle checklist item state.
   */
  async toggleChecklistItem(taskId, organizationId, workspaceId, itemId, completed, userId) {
    await this.getById(taskId, organizationId);

    const updated = await taskRepo.toggleChecklistItem(taskId, itemId, completed);

    await this.logActivity(userId, organizationId, workspaceId, 'task.checklist_toggled', taskId, {
      itemId,
      completed,
    });

    return taskRepo.findByIdPopulated(taskId);
  }

  /**
   * Add checklist item.
   */
  async addChecklistItem(taskId, organizationId, workspaceId, title, userId) {
    await this.getById(taskId, organizationId);

    const item = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title,
      completed: false,
    };

    await taskRepo.addChecklistItem(taskId, item);

    await this.logActivity(userId, organizationId, workspaceId, 'task.checklist_added', taskId, {
      itemTitle: title,
    });

    return taskRepo.findByIdPopulated(taskId);
  }

  /**
   * Remove checklist item.
   */
  async removeChecklistItem(taskId, organizationId, workspaceId, itemId, userId) {
    await this.getById(taskId, organizationId);

    await taskRepo.removeChecklistItem(taskId, itemId);

    await this.logActivity(userId, organizationId, workspaceId, 'task.checklist_removed', taskId, {
      itemId,
    });

    return taskRepo.findByIdPopulated(taskId);
  }

  /**
   * Soft-delete a task and all its subtasks.
   */
  async delete(taskId, organizationId, workspaceId, userId) {
    const task = await this.getById(taskId, organizationId);
    const { data: subtasks } = await subTaskRepo.findByTask(taskId);
    await Promise.all(subtasks.map((s) => subTaskRepo.deleteById(s._id)));

    const result = await taskRepo.deleteById(task._id);

    await this.logActivity(userId, organizationId, workspaceId, 'task.deleted', taskId);

    return result;
  }

  // ─── SubTask methods ─────────────────────────────────────────────────────────

  async createSubTask(data, taskId, organizationId, workspaceId, userId) {
    await this.getById(taskId, organizationId);

    const subtask = await subTaskRepo.create({
      ...data,
      parentTaskId: taskId,
      organizationId,
      createdBy: userId,
    });

    await this.logActivity(userId, organizationId, workspaceId, 'subtask.created', taskId, {
      subTaskId: subtask._id,
      title: subtask.title,
    });

    return subtask;
  }

  async listSubTasks(taskId, organizationId, options = {}) {
    await this.getById(taskId, organizationId);
    const result = await subTaskRepo.findByTask(taskId, options);
    return { docs: result.data, meta: result.meta };
  }

  async updateSubTask(subTaskId, taskId, organizationId, workspaceId, data, userId) {
    await this.getById(taskId, organizationId);
    const subtask = await subTaskRepo.findOne({
      _id: subTaskId,
      parentTaskId: taskId,
      deletedAt: null,
    });
    if (!subtask) {
      throw ApiError.notFound('SubTask not found.');
    }
    const updated = await subTaskRepo.updateById(subTaskId, data);

    await this.logActivity(userId, organizationId, workspaceId, 'subtask.updated', taskId, {
      subTaskId,
    });

    return updated;
  }

  async deleteSubTask(subTaskId, taskId, organizationId, workspaceId, userId) {
    await this.getById(taskId, organizationId);
    const subtask = await subTaskRepo.findOne({
      _id: subTaskId,
      parentTaskId: taskId,
      deletedAt: null,
    });
    if (!subtask) {
      throw ApiError.notFound('SubTask not found.');
    }
    const result = await subTaskRepo.deleteById(subTaskId);

    await this.logActivity(userId, organizationId, workspaceId, 'subtask.deleted', taskId, {
      subTaskId,
    });

    return result;
  }
}

export default TaskService;
