import { CommentService } from '../services/CommentService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const commentService = new CommentService();

export const list = asyncHandler(async (req, res) => {
  const result = await commentService.listByTask(req.params.taskId, req.query);
  res.status(200).json(new ApiResponse(200, 'Comments retrieved.', result));
});

export const create = asyncHandler(async (req, res) => {
  const comment = await commentService.create(
    req.body,
    req.params.taskId,
    req.params.orgId,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Comment added.', { comment }));
});

export const update = asyncHandler(async (req, res) => {
  const comment = await commentService.update(req.params.commentId, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Comment updated.', { comment }));
});

export const deleteComment = asyncHandler(async (req, res) => {
  await commentService.delete(req.params.commentId, req.user._id, req.membership);
  res.status(204).send();
});
