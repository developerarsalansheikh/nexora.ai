import { BaseRepository } from './BaseRepository.js';
import SubTask from '../models/SubTask.js';

export class SubTaskRepository extends BaseRepository {
  constructor() {
    super(SubTask);
  }

  /** Find all subtasks belonging to a parent task */
  async findByTask(taskId, options = {}) {
    return this.findAll({ parentTaskId: taskId, deletedAt: null }, options);
  }
}

export default SubTaskRepository;
