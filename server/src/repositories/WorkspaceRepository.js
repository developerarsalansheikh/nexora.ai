import { BaseRepository } from './BaseRepository.js';
import Workspace from '../models/Workspace.js';

export class WorkspaceRepository extends BaseRepository {
  constructor() {
    super(Workspace);
  }

  /** Find all workspaces in an organization */
  async findByOrganization(organizationId, options = {}) {
    return this.findAll({ organizationId, deletedAt: null }, options);
  }

  /** Find workspace by slug within an org */
  async findBySlug(organizationId, slug) {
    return Workspace.findOne({ organizationId, slug, deletedAt: null });
  }
}

export default WorkspaceRepository;
