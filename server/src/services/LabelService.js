import { BaseService } from './BaseService.js';
import { LabelRepository } from '../repositories/LabelRepository.js';
import { ApiError } from '../utils/apiError.js';

const labelRepo = new LabelRepository();

export class LabelService extends BaseService {
  constructor() {
    super(labelRepo);
  }

  /** List all labels in a workspace. */
  async listByWorkspace(workspaceId, options = {}) {
    return labelRepo.findByWorkspace(workspaceId, options);
  }

  /** Create a label in a workspace. */
  async create(data, workspaceId, organizationId, userId) {
    return labelRepo.create({
      ...data,
      workspaceId,
      organizationId,
      createdBy: userId,
    });
  }

  /** Update a label. */
  async update(labelId, workspaceId, data) {
    const label = await labelRepo.findOne({ _id: labelId, workspaceId, deletedAt: null });
    if (!label) {
      throw ApiError.notFound('Label not found.');
    }
    return labelRepo.updateById(labelId, data);
  }

  /** Delete a label. */
  async delete(labelId, workspaceId) {
    const label = await labelRepo.findOne({ _id: labelId, workspaceId, deletedAt: null });
    if (!label) {
      throw ApiError.notFound('Label not found.');
    }
    return labelRepo.deleteById(labelId);
  }
}

export default LabelService;
