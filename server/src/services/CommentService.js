import { BaseService } from './BaseService.js';
import { CommentRepository } from '../repositories/CommentRepository.js';
import { ApiError } from '../utils/apiError.js';

const commentRepo = new CommentRepository();

export class CommentService extends BaseService {
  constructor() {
    super(commentRepo);
  }

  /** List all comments on a task. */
  async listByTask(taskId, options = {}) {
    return commentRepo.findByTask(taskId, options);
  }

  /** Add a comment to a task. */
  async create(data, taskId, organizationId, userId) {
    return commentRepo.create({
      ...data,
      taskId,
      organizationId,
      authorId: userId,
      createdBy: userId,
    });
  }

  /** Update a comment — only the author can edit. */
  async update(commentId, data, userId) {
    const comment = await commentRepo.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }
    if (String(comment.authorId) !== String(userId)) {
      throw ApiError.forbidden('You can only edit your own comments.');
    }
    return commentRepo.updateById(commentId, { content: data.content });
  }

  /** Delete a comment — author or admin/owner can delete. */
  async delete(commentId, userId, membership) {
    const comment = await commentRepo.findById(commentId);
    if (!comment) {
      throw ApiError.notFound('Comment not found.');
    }
    const isAuthor = String(comment.authorId) === String(userId);
    const isPrivileged = ['owner', 'admin'].includes(membership.role);
    if (!isAuthor && !isPrivileged) {
      throw ApiError.forbidden('You cannot delete this comment.');
    }
    return commentRepo.deleteById(commentId);
  }
}

export default CommentService;
