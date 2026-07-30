import { BaseRepository } from './BaseRepository.js';
import Label from '../models/Label.js';

export class LabelRepository extends BaseRepository {
  constructor() {
    super(Label);
  }

  /** Find all labels in a workspace (labels are workspace-scoped) */
  async findByWorkspace(workspaceId, options = {}) {
    return this.findAll({ workspaceId, deletedAt: null }, options);
  }
}

export default LabelRepository;
