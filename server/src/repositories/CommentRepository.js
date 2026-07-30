import { BaseRepository } from './BaseRepository.js';
import Comment from '../models/Comment.js';

export class CommentRepository extends BaseRepository {
  constructor() {
    super(Comment);
  }

  /** Find all comments on a task */
  async findByTask(taskId, options = {}) {
    return this.findAll(
      { taskId, deletedAt: null },
      {
        populate: { path: 'authorId', select: 'name username avatar' },
        sort: 'createdAt',
        ...options,
      },
    );
  }
}

export default CommentRepository;
