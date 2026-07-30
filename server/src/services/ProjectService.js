import { BaseService } from './BaseService.js';
import { ProjectRepository } from '../repositories/ProjectRepository.js';
import ActivityLog from '../models/ActivityLog.js';
import { ApiError } from '../utils/apiError.js';

const projectRepo = new ProjectRepository();

export class ProjectService extends BaseService {
  constructor() {
    super(projectRepo);
  }

  /**
   * Helper to log activity entries for project events.
   */
  async logActivity(userId, organizationId, workspaceId, action, projectId, metadata = {}) {
    try {
      await ActivityLog.create({
        userId,
        organizationId,
        workspaceId,
        action,
        entityType: 'Project',
        entityId: projectId,
        metadata,
      });
    } catch (err) {
      console.error('Failed to log project activity:', err.message);
    }
  }

  /**
   * Create a new project within a workspace.
   * Validates duplicate project key inside the same workspace.
   */
  async create(data, workspaceId, organizationId, userId) {
    const existingKey = await projectRepo.findByKey(workspaceId, data.key);
    if (existingKey) {
      throw ApiError.conflict(`Project key '${data.key.toUpperCase()}' is already in use within this workspace.`);
    }

    const initialMembers = [
      { userId, role: 'lead', addedAt: new Date() },
    ];

    if (data.members && Array.isArray(data.members)) {
      data.members.forEach((m) => {
        if (m.userId && m.userId.toString() !== userId.toString()) {
          initialMembers.push({
            userId: m.userId,
            role: m.role || 'member',
            addedAt: new Date(),
          });
        }
      });
    }

    const projectData = {
      ...data,
      workspaceId,
      organizationId,
      ownerId: data.ownerId || userId,
      members: initialMembers,
      createdBy: userId,
    };

    const project = await projectRepo.create(projectData);

    await this.logActivity(userId, organizationId, workspaceId, 'project.created', project._id, {
      name: project.name,
      key: project.key,
      visibility: project.visibility,
    });

    return projectRepo.findByIdPopulated(project._id);
  }

  /**
   * List projects in a workspace with filters, search, sort, and pagination.
   */
  async listByWorkspace(workspaceId, options = {}, userId) {
    return projectRepo.findByWorkspace(workspaceId, { ...options, userId });
  }

  /**
   * Get single project details by ID with populated references.
   */
  async getById(projectId, organizationId) {
    const project = await projectRepo.findByIdPopulated(projectId);
    if (!project) {
      throw ApiError.notFound('Project not found.');
    }
    if (project.organizationId._id ? project.organizationId._id.toString() !== organizationId.toString() : project.organizationId.toString() !== organizationId.toString()) {
      throw ApiError.notFound('Project not found in this organization.');
    }
    return project;
  }

  /**
   * Update project metadata.
   */
  async update(projectId, organizationId, workspaceId, data, membership, userId) {
    if (!['owner', 'admin', 'project_manager', 'team_lead'].includes(membership.role)) {
      throw ApiError.forbidden('You do not have permission to update project details.');
    }

    const project = await this.getById(projectId, organizationId);

    if (data.key && data.key.toUpperCase() !== project.key) {
      const existingKey = await projectRepo.findByKey(workspaceId, data.key);
      if (existingKey && existingKey._id.toString() !== projectId.toString()) {
        throw ApiError.conflict(`Project key '${data.key.toUpperCase()}' is already used by another project in this workspace.`);
      }
    }

    const updated = await projectRepo.updateById(projectId, data);

    await this.logActivity(userId, organizationId, workspaceId, 'project.updated', projectId, {
      changes: Object.keys(data),
    });

    return projectRepo.findByIdPopulated(projectId);
  }

  /**
   * Archive a project.
   */
  async archive(projectId, organizationId, workspaceId, membership, userId) {
    if (!['owner', 'admin', 'project_manager'].includes(membership.role)) {
      throw ApiError.forbidden('Only organization admins or project managers can archive projects.');
    }
    await this.getById(projectId, organizationId);

    const archivedProject = await projectRepo.archive(projectId);

    await this.logActivity(userId, organizationId, workspaceId, 'project.archived', projectId);

    return projectRepo.findByIdPopulated(projectId);
  }

  /**
   * Restore an archived project.
   */
  async restore(projectId, organizationId, workspaceId, membership, userId) {
    if (!['owner', 'admin', 'project_manager'].includes(membership.role)) {
      throw ApiError.forbidden('Only organization admins or project managers can restore archived projects.');
    }
    await this.getById(projectId, organizationId);

    await projectRepo.restore(projectId);

    await this.logActivity(userId, organizationId, workspaceId, 'project.restored', projectId);

    return projectRepo.findByIdPopulated(projectId);
  }

  /**
   * Toggle project favorite status for the active user.
   */
  async toggleFavorite(projectId, organizationId, workspaceId, userId) {
    await this.getById(projectId, organizationId);

    const result = await projectRepo.toggleFavorite(projectId, userId);

    await this.logActivity(
      userId,
      organizationId,
      workspaceId,
      result.isFavorited ? 'project.favorited' : 'project.unfavorited',
      projectId,
    );

    return result;
  }

  /**
   * Duplicate a project within the workspace.
   */
  async duplicate(projectId, organizationId, workspaceId, newName, newKey, userId) {
    const existingKey = await projectRepo.findByKey(workspaceId, newKey);
    if (existingKey) {
      throw ApiError.conflict(`Target project key '${newKey.toUpperCase()}' is already taken in this workspace.`);
    }

    const duplicated = await projectRepo.duplicateProject(projectId, newName, newKey, userId);

    await this.logActivity(userId, organizationId, workspaceId, 'project.duplicated', duplicated._id, {
      sourceProjectId: projectId,
      newName,
      newKey,
    });

    return projectRepo.findByIdPopulated(duplicated._id);
  }

  /**
   * Add a member to a project.
   */
  async addMember(projectId, organizationId, workspaceId, targetUserId, role, userId) {
    await this.getById(projectId, organizationId);

    const updated = await projectRepo.addMember(projectId, targetUserId, role);

    await this.logActivity(userId, organizationId, workspaceId, 'project.member_added', projectId, {
      addedUserId: targetUserId,
      role,
    });

    return updated;
  }

  /**
   * Remove a member from a project.
   */
  async removeMember(projectId, organizationId, workspaceId, targetUserId, userId) {
    await this.getById(projectId, organizationId);

    const updated = await projectRepo.removeMember(projectId, targetUserId);

    await this.logActivity(userId, organizationId, workspaceId, 'project.member_removed', projectId, {
      removedUserId: targetUserId,
    });

    return updated;
  }

  /**
   * Update a project member's role.
   */
  async updateMemberRole(projectId, organizationId, workspaceId, targetUserId, role, userId) {
    await this.getById(projectId, organizationId);

    const updated = await projectRepo.updateMemberRole(projectId, targetUserId, role);

    await this.logActivity(userId, organizationId, workspaceId, 'project.member_role_updated', projectId, {
      targetUserId,
      newRole: role,
    });

    return updated;
  }

  /**
   * Fetch activity logs for a project.
   */
  async getActivityLog(projectId, organizationId) {
    await this.getById(projectId, organizationId);

    return ActivityLog.find({ entityId: projectId, entityType: 'Project' })
      .populate('userId', 'name email avatar')
      .sort('-createdAt')
      .limit(50)
      .lean({ virtuals: true });
  }

  /**
   * Soft-delete a project.
   */
  async delete(projectId, organizationId, workspaceId, membership, userId) {
    if (!['owner', 'admin'].includes(membership.role)) {
      throw ApiError.forbidden('Only organization owners or admins can permanently delete projects.');
    }
    await this.getById(projectId, organizationId);

    const result = await projectRepo.deleteById(projectId);

    await this.logActivity(userId, organizationId, workspaceId, 'project.deleted', projectId);

    return result;
  }
}

export default ProjectService;
