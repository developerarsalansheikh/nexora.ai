import { BaseService } from './BaseService.js';
import { WorkspaceRepository } from '../repositories/WorkspaceRepository.js';
import { ApiError } from '../utils/apiError.js';

const workspaceRepo = new WorkspaceRepository();

export class WorkspaceService extends BaseService {
  constructor() {
    super(workspaceRepo);
  }

  /** Create a new workspace inside an organization. */
  async create(data, organizationId, userId) {
    const existing = await workspaceRepo.findOne({
      name: { $regex: new RegExp(`^${data.name}$`, 'i') },
      organizationId,
      deletedAt: null,
    });
    if (existing) {
      throw ApiError.conflict(`A workspace named '${data.name}' already exists in this organization.`);
    }

    const workspace = await workspaceRepo.create({
      ...data,
      organizationId,
      createdBy: userId,
    });
    return workspace;
  }

  /** List all workspaces in an organization. */
  async listByOrg(organizationId, options = {}) {
    return workspaceRepo.findByOrganization(organizationId, options);
  }

  /** Get a workspace by ID (scoped to org). */
  async getById(workspaceId, organizationId) {
    const workspace = await workspaceRepo.findOne({
      _id: workspaceId,
      organizationId,
      deletedAt: null,
    });
    if (!workspace) {
      throw ApiError.notFound('Workspace not found.');
    }
    return workspace;
  }

  /** Update a workspace — admin/owner only. */
  async update(workspaceId, organizationId, data, membership) {
    if (!['owner', 'admin'].includes(membership.role)) {
      throw ApiError.forbidden('Only admins can update workspaces.');
    }
    const workspace = await workspaceRepo.findOne({
      _id: workspaceId,
      organizationId,
      deletedAt: null,
    });
    if (!workspace) {
      throw ApiError.notFound('Workspace not found.');
    }

    if (data.name && data.name.toLowerCase() !== workspace.name.toLowerCase()) {
      const existing = await workspaceRepo.findOne({
        name: { $regex: new RegExp(`^${data.name}$`, 'i') },
        organizationId,
        deletedAt: null,
      });
      if (existing) {
        throw ApiError.conflict(`A workspace named '${data.name}' already exists in this organization.`);
      }
    }

    return workspaceRepo.updateById(workspaceId, data);
  }

  /** Soft-delete a workspace — admin/owner only. */
  async delete(workspaceId, organizationId, membership) {
    if (!['owner', 'admin'].includes(membership.role)) {
      throw ApiError.forbidden('Only admins can delete workspaces.');
    }
    const workspace = await workspaceRepo.findOne({
      _id: workspaceId,
      organizationId,
      deletedAt: null,
    });
    if (!workspace) {
      throw ApiError.notFound('Workspace not found.');
    }
    return workspaceRepo.deleteById(workspaceId);
  }
}

export default WorkspaceService;
