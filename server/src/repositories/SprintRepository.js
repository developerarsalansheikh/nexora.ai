import { BaseRepository } from './BaseRepository.js';
import Sprint from '../models/Sprint.js';

export class SprintRepository extends BaseRepository {
  constructor() {
    super(Sprint);
  }

  /**
   * Find all sprints for a project sorted by status and createdAt.
   */
  async findByProject(projectId, options = {}) {
    const { status, page = 1, limit = 50 } = options;
    const filter = { projectId, deletedAt: null };
    if (status) {
      filter.status = status;
    }
    return this.findAll(filter, { page, limit, sort: '-createdAt' });
  }

  /**
   * Find single active sprint in a project.
   */
  async findActiveSprint(projectId) {
    return Sprint.findOne({ projectId, status: 'active', deletedAt: null }).lean({ virtuals: true });
  }

  /**
   * Find sprint by name in project to check duplicates.
   */
  async findByName(projectId, name) {
    return Sprint.findOne({
      projectId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      deletedAt: null,
    }).lean({ virtuals: true });
  }

  /**
   * Find all completed sprints in project for velocity history.
   */
  async findCompletedSprints(projectId) {
    return Sprint.find({ projectId, status: 'completed', deletedAt: null })
      .sort({ completedAt: 1 })
      .lean({ virtuals: true });
  }

  /**
   * Push daily burndown data snapshot to active sprint.
   */
  async pushBurndownSnapshot(sprintId, date, remainingPoints, idealPoints) {
    return Sprint.findByIdAndUpdate(
      sprintId,
      {
        $push: {
          burndown: { date, remainingPoints, idealPoints },
        },
      },
      { new: true },
    ).lean({ virtuals: true });
  }

  /**
   * Update sprint retrospective notes.
   */
  async updateRetrospective(sprintId, retrospective) {
    return Sprint.findByIdAndUpdate(
      sprintId,
      { $set: { retrospective } },
      { new: true },
    ).lean({ virtuals: true });
  }

  /**
   * Update sprint capacity configuration.
   */
  async updateCapacity(sprintId, capacity) {
    return Sprint.findByIdAndUpdate(
      sprintId,
      { $set: { capacity } },
      { new: true },
    ).lean({ virtuals: true });
  }
}

export default SprintRepository;
