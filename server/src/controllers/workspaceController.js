import { WorkspaceService } from '../services/WorkspaceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const workspaceService = new WorkspaceService();

export const create = asyncHandler(async (req, res) => {
  // WorkspaceService.create(data, organizationId, userId)
  const ws = await workspaceService.create(req.body, req.params.orgId, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Workspace created.', { workspace: ws }));
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await workspaceService.listByOrg(req.params.orgId, { page, limit });
  res.status(200).json(new ApiResponse(200, 'Workspaces retrieved.', result));
});

export const getById = asyncHandler(async (req, res) => {
  const ws = await workspaceService.getById(req.params.workspaceId, req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Workspace retrieved.', { workspace: ws }));
});

export const update = asyncHandler(async (req, res) => {
  const ws = await workspaceService.update(
    req.params.workspaceId,
    req.params.orgId,
    req.body,
    req.membership,
  );
  res.status(200).json(new ApiResponse(200, 'Workspace updated.', { workspace: ws }));
});

export const deleteWorkspace = asyncHandler(async (req, res) => {
  await workspaceService.delete(req.params.workspaceId, req.params.orgId, req.membership);
  res.status(204).send();
});
