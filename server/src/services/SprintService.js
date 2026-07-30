import { BaseService } from './BaseService.js';
import { SprintRepository } from '../repositories/SprintRepository.js';
import { TaskRepository } from '../repositories/TaskRepository.js';
import ActivityLog from '../models/ActivityLog.js';
import Task from '../models/Task.js';
import { ApiError } from '../utils/apiError.js';

const sprintRepo = new SprintRepository();
const taskRepo = new TaskRepository();

export class SprintService extends BaseService {
  constructor() {
    super(sprintRepo);
  }

  /**
   * Helper to log activity entries for sprint events.
   */
  async logActivity(userId, organizationId, workspaceId, action, sprintId, metadata = {}) {
    try {
      await ActivityLog.create({
        userId,
        organizationId,
        workspaceId,
        action,
        entityType: 'Sprint',
        entityId: sprintId,
        metadata,
      });
    } catch (err) {
      console.error('Failed to log sprint activity:', err.message);
    }
  }

  /**
   * Create a sprint in a project — checks duplicate names.
   */
  async create(data, projectId, workspaceId, organizationId, userId) {
    const existing = await sprintRepo.findByName(projectId, data.name);
    if (existing) {
      throw ApiError.badRequest(`Sprint with name "${data.name}" already exists in this project.`);
    }

    const sprint = await sprintRepo.create({
      ...data,
      projectId,
      workspaceId,
      organizationId,
      createdBy: userId,
      status: 'draft',
    });

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.created', sprint._id, {
      name: sprint.name,
      goal: sprint.goal,
    });

    return sprint;
  }

  /**
   * List all sprints in a project.
   */
  async listByProject(projectId, options = {}) {
    return sprintRepo.findByProject(projectId, options);
  }

  /**
   * Get active sprint in a project.
   */
  async getActiveSprint(projectId) {
    return sprintRepo.findActiveSprint(projectId);
  }

  /**
   * Get a sprint by ID — validates org scope.
   */
  async getById(sprintId, organizationId) {
    const sprint = await sprintRepo.findOne({
      _id: sprintId,
      organizationId,
      deletedAt: null,
    });
    if (!sprint) {
      throw ApiError.notFound('Sprint not found.');
    }
    return sprint;
  }

  /**
   * Start a sprint — strictly enforces max 1 active sprint per project.
   */
  async start(sprintId, projectId, workspaceId, organizationId, userId) {
    const activeSprint = await sprintRepo.findActiveSprint(projectId);
    if (activeSprint && String(activeSprint._id) !== String(sprintId)) {
      throw ApiError.conflict(
        `Sprint "${activeSprint.name}" is already active in this project. Complete it before starting a new one.`,
      );
    }

    const sprint = await this.getById(sprintId, organizationId);
    if (sprint.status === 'active') {
      throw ApiError.badRequest('Sprint is already active.');
    }
    if (sprint.status === 'completed') {
      throw ApiError.badRequest('Cannot start a completed sprint.');
    }

    // Calculate total planned story points for initial velocity baseline
    const sprintTasks = await Task.find({ sprintId, deletedAt: null }).lean();
    const plannedPoints = sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // Initial burndown snapshot
    const initialBurndown = [
      {
        date: new Date(),
        remainingPoints: plannedPoints,
        idealPoints: plannedPoints,
      },
    ];

    const updated = await sprintRepo.updateById(sprintId, {
      status: 'active',
      startDate: sprint.startDate || new Date(),
      'velocity.plannedPoints': plannedPoints,
      burndown: initialBurndown,
    });

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.started', sprintId, {
      name: sprint.name,
      plannedPoints,
    });

    return updated;
  }

  /**
   * Complete a sprint — computes completed velocity & handles unfinished tasks.
   * @param {string} sprintId
   * @param {string} moveToSprintId - Optional target sprint for uncompleted tasks (or backlog if empty)
   */
  async complete(sprintId, projectId, workspaceId, organizationId, userId, moveToSprintId = null) {
    const sprint = await this.getById(sprintId, organizationId);
    if (sprint.status !== 'active') {
      throw ApiError.badRequest('Only active sprints can be completed.');
    }

    const sprintTasks = await Task.find({ sprintId, deletedAt: null }).lean();
    const completedTasks = sprintTasks.filter((t) => t.status === 'done');
    const unfinishedTasks = sprintTasks.filter((t) => t.status !== 'done');

    const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const plannedPoints = sprint.velocity?.plannedPoints || sprintTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    // Move unfinished tasks to destination sprint or backlog (sprintId = null)
    if (unfinishedTasks.length > 0) {
      const targetSprintId = moveToSprintId || null;
      await Task.updateMany(
        { _id: { $in: unfinishedTasks.map((t) => t._id) } },
        { $set: { sprintId: targetSprintId } },
      );
    }

    const updated = await sprintRepo.updateById(sprintId, {
      status: 'completed',
      endDate: new Date(),
      completedAt: new Date(),
      'velocity.completedPoints': completedPoints,
      'velocity.plannedPoints': plannedPoints,
    });

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.completed', sprintId, {
      name: sprint.name,
      completedPoints,
      plannedPoints,
      unfinishedCount: unfinishedTasks.length,
    });

    return updated;
  }

  /**
   * Get Burndown Data for active or completed sprint.
   */
  async getBurndownData(sprintId, organizationId) {
    const sprint = await this.getById(sprintId, organizationId);
    const tasks = await Task.find({ sprintId, deletedAt: null }).lean();

    const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = tasks.filter((t) => t.status === 'done').reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const remainingPoints = totalPoints - completedPoints;

    return {
      sprintId: sprint._id,
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      totalPoints,
      completedPoints,
      remainingPoints,
      snapshots: sprint.burndown || [],
    };
  }

  /**
   * Get Velocity Chart dataset across completed sprints in a project.
   */
  async getVelocityChart(projectId) {
    const completedSprints = await sprintRepo.findCompletedSprints(projectId);
    return completedSprints.map((s) => ({
      sprintId: s._id,
      name: s.name,
      plannedPoints: s.velocity?.plannedPoints || 0,
      completedPoints: s.velocity?.completedPoints || 0,
      completedAt: s.completedAt,
    }));
  }

  /**
   * Update sprint retrospective notes.
   */
  async updateRetrospective(sprintId, organizationId, workspaceId, retrospective, userId) {
    await this.getById(sprintId, organizationId);
    const updated = await sprintRepo.updateRetrospective(sprintId, retrospective);

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.retrospective_updated', sprintId);

    return updated;
  }

  /**
   * Update sprint capacity configuration.
   */
  async updateCapacity(sprintId, organizationId, workspaceId, capacity, userId) {
    await this.getById(sprintId, organizationId);
    const updated = await sprintRepo.updateCapacity(sprintId, capacity);

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.capacity_updated', sprintId);

    return updated;
  }

  /**
   * Assign or move tasks into a sprint.
   */
  async moveTasksToSprint(sprintId, taskIds, organizationId, workspaceId, userId) {
    if (sprintId !== 'backlog' && sprintId !== null) {
      await this.getById(sprintId, organizationId);
    }
    const targetSprintId = sprintId === 'backlog' ? null : sprintId;

    await Task.updateMany(
      { _id: { $in: taskIds }, organizationId },
      { $set: { sprintId: targetSprintId } },
    );

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.tasks_moved', sprintId || 'backlog', {
      taskCount: taskIds.length,
    });

    return true;
  }

  /**
   * Update sprint metadata.
   */
  async update(sprintId, organizationId, workspaceId, data, userId) {
    await this.getById(sprintId, organizationId);
    const updated = await sprintRepo.updateById(sprintId, data);

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.updated', sprintId, {
      updatedFields: Object.keys(data),
    });

    return updated;
  }

  /**
   * Soft-delete a sprint.
   */
  async delete(sprintId, organizationId, workspaceId, userId) {
    const sprint = await this.getById(sprintId, organizationId);
    if (sprint.status === 'active') {
      throw ApiError.badRequest('Cannot delete an active sprint.');
    }

    // Unassign tasks from this sprint back to backlog
    await Task.updateMany({ sprintId }, { $set: { sprintId: null } });

    const result = await sprintRepo.deleteById(sprintId);

    await this.logActivity(userId, organizationId, workspaceId, 'sprint.deleted', sprintId);

    return result;
  }
}

export default SprintService;
