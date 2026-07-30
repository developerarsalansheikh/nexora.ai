import { ProjectService } from '../services/ProjectService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const projectService = new ProjectService();

export const create = asyncHandler(async (req, res) => {
  const project = await projectService.create(
    req.body,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Project created successfully.', { project }));
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, search, status, visibility, category, isArchived, isFavorite, sort } = req.query;
  let workspaceId = req.params.workspaceId;
  const organizationId = req.params.orgId;

  if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') {
    const Workspace = (await import('../models/Workspace.js')).default;
    const defaultWs = await Workspace.findOne({ organizationId, deletedAt: null });
    if (defaultWs) workspaceId = defaultWs._id.toString();
  }
  const result = await projectService.listByWorkspace(
    workspaceId,
    { page, limit, search, status, visibility, category, isArchived, isFavorite, sort, organizationId },
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Projects retrieved successfully.', result));
});

export const getById = asyncHandler(async (req, res) => {
  const project = await projectService.getById(req.params.projectId, req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Project details retrieved.', { project }));
});

export const update = asyncHandler(async (req, res) => {
  const project = await projectService.update(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.body,
    req.membership,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Project updated successfully.', { project }));
});

export const archive = asyncHandler(async (req, res) => {
  const project = await projectService.archive(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.membership,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Project archived successfully.', { project }));
});

export const restore = asyncHandler(async (req, res) => {
  const project = await projectService.restore(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.membership,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Project restored successfully.', { project }));
});

export const toggleFavorite = asyncHandler(async (req, res) => {
  const result = await projectService.toggleFavorite(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(
    new ApiResponse(
      200,
      result.isFavorited ? 'Project added to favorites.' : 'Project removed from favorites.',
      { isFavorited: result.isFavorited, project: result.project },
    ),
  );
});

export const duplicate = asyncHandler(async (req, res) => {
  const { name, key } = req.body;
  if (!name || !key) {
    res.status(400).json(new ApiResponse(400, 'New project name and key are required for duplication.'));
    return;
  }
  const project = await projectService.duplicate(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    name,
    key,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Project duplicated successfully.', { project }));
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const project = await projectService.addMember(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    userId,
    role,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Member added to project.', { project }));
});

export const removeMember = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const project = await projectService.removeMember(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    userId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Member removed from project.', { project }));
});

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const project = await projectService.updateMemberRole(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    userId,
    role,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Member role updated.', { project }));
});

export const getActivityLog = asyncHandler(async (req, res) => {
  const activities = await projectService.getActivityLog(req.params.projectId, req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Project activity log retrieved.', { activities }));
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectService.delete(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.membership,
    req.user._id,
  );
  res.status(204).send();
});
