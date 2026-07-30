import { SprintService } from '../services/SprintService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const sprintService = new SprintService();

export const create = asyncHandler(async (req, res) => {
  const sprint = await sprintService.create(
    req.body,
    req.params.projectId,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Sprint created.', { sprint }));
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await sprintService.listByProject(req.params.projectId, { page, limit, status });
  res.status(200).json(new ApiResponse(200, 'Sprints retrieved.', result));
});

export const getActiveSprint = asyncHandler(async (req, res) => {
  const sprint = await sprintService.getActiveSprint(req.params.projectId);
  res.status(200).json(new ApiResponse(200, 'Active sprint retrieved.', { sprint }));
});

export const getById = asyncHandler(async (req, res) => {
  const sprint = await sprintService.getById(req.params.sprintId, req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Sprint retrieved.', { sprint }));
});

export const update = asyncHandler(async (req, res) => {
  const sprint = await sprintService.update(
    req.params.sprintId,
    req.params.orgId,
    req.params.workspaceId,
    req.body,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Sprint updated.', { sprint }));
});

export const startSprint = asyncHandler(async (req, res) => {
  const sprint = await sprintService.start(
    req.params.sprintId,
    req.params.projectId,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Sprint started.', { sprint }));
});

export const completeSprint = asyncHandler(async (req, res) => {
  const { moveToSprintId } = req.body;
  const sprint = await sprintService.complete(
    req.params.sprintId,
    req.params.projectId,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
    moveToSprintId,
  );
  res.status(200).json(new ApiResponse(200, 'Sprint completed.', { sprint }));
});

export const getBurndownData = asyncHandler(async (req, res) => {
  const burndown = await sprintService.getBurndownData(req.params.sprintId, req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Sprint burndown data retrieved.', { burndown }));
});

export const getVelocityChart = asyncHandler(async (req, res) => {
  const velocity = await sprintService.getVelocityChart(req.params.projectId);
  res.status(200).json(new ApiResponse(200, 'Project velocity data retrieved.', { velocity }));
});

export const updateRetrospective = asyncHandler(async (req, res) => {
  const sprint = await sprintService.updateRetrospective(
    req.params.sprintId,
    req.params.orgId,
    req.params.workspaceId,
    req.body,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Retrospective updated.', { sprint }));
});

export const updateCapacity = asyncHandler(async (req, res) => {
  const sprint = await sprintService.updateCapacity(
    req.params.sprintId,
    req.params.orgId,
    req.params.workspaceId,
    req.body,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Sprint capacity updated.', { sprint }));
});

export const moveTasksToSprint = asyncHandler(async (req, res) => {
  const { taskIds } = req.body;
  if (!taskIds || !Array.isArray(taskIds)) {
    res.status(400).json(new ApiResponse(400, 'Task IDs array is required.'));
    return;
  }
  await sprintService.moveTasksToSprint(
    req.params.sprintId,
    taskIds,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Tasks moved into sprint.'));
});

export const deleteSprint = asyncHandler(async (req, res) => {
  await sprintService.delete(
    req.params.sprintId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(204).send();
});
