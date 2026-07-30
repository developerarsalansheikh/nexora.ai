import { LabelService } from '../services/LabelService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const labelService = new LabelService();

export const list = asyncHandler(async (req, res) => {
  // Labels are workspace-scoped
  const result = await labelService.listByWorkspace(req.params.workspaceId, req.query);
  res.status(200).json(new ApiResponse(200, 'Labels retrieved.', result));
});

export const create = asyncHandler(async (req, res) => {
  const label = await labelService.create(
    req.body,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Label created.', { label }));
});

export const update = asyncHandler(async (req, res) => {
  const label = await labelService.update(req.params.labelId, req.params.workspaceId, req.body);
  res.status(200).json(new ApiResponse(200, 'Label updated.', { label }));
});

export const deleteLabel = asyncHandler(async (req, res) => {
  await labelService.delete(req.params.labelId, req.params.workspaceId);
  res.status(204).send();
});
