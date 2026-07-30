/**
 * Base Service class for Nexora.ai.
 *
 * Architecture (layered, unidirectional):
 *   Controllers → Services → Repositories → Models → MongoDB
 *
 * Rules:
 *  - Services contain ALL business logic
 *  - Services communicate ONLY through Repository instances
 *  - Services NEVER use res/req objects
 *  - Controllers ONLY call service methods and handle HTTP concerns
 *
 * Usage:
 *   class ProjectService extends BaseService {
 *     constructor() {
 *       super(new ProjectRepository());
 *     }
 *
 *     async getActiveProjects(workspaceId) {
 *       return this.repository.findAll({ workspace: workspaceId, status: 'active' });
 *     }
 *   }
 */
export class BaseService {
  /**
   * @param {import('../repositories/BaseRepository').BaseRepository} repository
   */
  constructor(repository) {
    if (!repository) {
      throw new Error('BaseService requires a repository instance.');
    }
    this.repository = repository;
  }
}

export default BaseService;
