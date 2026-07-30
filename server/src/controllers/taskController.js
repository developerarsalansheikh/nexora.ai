import { TaskService } from '../services/TaskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const taskService = new TaskService();

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {
  const task = await taskService.create(
    req.body,
    req.params.projectId,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Task created successfully.', { task }));
});

export const list = asyncHandler(async (req, res) => {
  const { page, limit, sprintId, status, priority, type, assignee, reporter, search, sort } = req.query;
  const options = { page, limit, sprintId, status, priority, type, assignee, reporter, search, sort };

  const result = sprintId
    ? await taskService.listBySprint(sprintId, options)
    : await taskService.listByProject(req.params.projectId, options);

  res.status(200).json(new ApiResponse(200, 'Tasks retrieved successfully.', result));
});

export const getById = asyncHandler(async (req, res) => {
  const task = await taskService.getById(req.params.taskId, req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Task details retrieved.', { task }));
});

export const update = asyncHandler(async (req, res) => {
  const task = await taskService.update(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    req.body,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Task updated successfully.', { task }));
});

export const reorder = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    res.status(400).json(new ApiResponse(400, 'Items array is required for reordering.'));
    return;
  }

  await taskService.reorderTasks(
    req.params.projectId,
    req.params.orgId,
    req.params.workspaceId,
    items,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Tasks reordered successfully.'));
});

export const addWorkLog = asyncHandler(async (req, res) => {
  const { hours, comment } = req.body;
  if (hours === undefined || typeof hours !== 'number' || hours <= 0) {
    res.status(400).json(new ApiResponse(400, 'Hours logged must be a positive number.'));
    return;
  }
  const task = await taskService.addWorkLog(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
    hours,
    comment || '',
  );
  res.status(200).json(new ApiResponse(200, 'Work log added successfully.', { task }));
});

export const toggleWatcher = asyncHandler(async (req, res) => {
  const result = await taskService.toggleWatcher(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(
    new ApiResponse(
      200,
      result.isWatching ? 'Started watching task.' : 'Stopped watching task.',
      { isWatching: result.isWatching, task: result.task },
    ),
  );
});

export const addDependency = asyncHandler(async (req, res) => {
  const { targetTaskId, type } = req.body;
  if (!targetTaskId) {
    res.status(400).json(new ApiResponse(400, 'Target task ID is required for dependency link.'));
    return;
  }
  const task = await taskService.addDependency(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    targetTaskId,
    type || 'blocked_by',
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Dependency added successfully.', { task }));
});

export const removeDependency = asyncHandler(async (req, res) => {
  const { targetTaskId } = req.params;
  const task = await taskService.removeDependency(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    targetTaskId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Dependency removed.', { task }));
});

export const toggleChecklistItem = asyncHandler(async (req, res) => {
  const { itemId, completed } = req.body;
  const task = await taskService.toggleChecklistItem(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    itemId,
    completed,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Checklist item toggled.', { task }));
});

export const addChecklistItem = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    res.status(400).json(new ApiResponse(400, 'Checklist title is required.'));
    return;
  }
  const task = await taskService.addChecklistItem(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    title,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Checklist item added.', { task }));
});

export const removeChecklistItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const task = await taskService.removeChecklistItem(
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    itemId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Checklist item removed.', { task }));
});

export const deleteTask = asyncHandler(async (req, res) => {
  await taskService.delete(req.params.taskId, req.params.orgId, req.params.workspaceId, req.user._id);
  res.status(204).send();
});

// ─── SubTasks ─────────────────────────────────────────────────────────────────

export const createSubTask = asyncHandler(async (req, res) => {
  const subtask = await taskService.createSubTask(
    req.body,
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'SubTask created.', { subtask }));
});

export const listSubTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listSubTasks(req.params.taskId, req.params.orgId, req.query);
  res.status(200).json(new ApiResponse(200, 'SubTasks retrieved.', result));
});

export const updateSubTask = asyncHandler(async (req, res) => {
  const subtask = await taskService.updateSubTask(
    req.params.subTaskId,
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    req.body,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'SubTask updated.', { subtask }));
});

export const deleteSubTask = asyncHandler(async (req, res) => {
  await taskService.deleteSubTask(
    req.params.subTaskId,
    req.params.taskId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(204).send();
});
