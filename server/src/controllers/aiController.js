import aiService from '../services/ai/AiService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

// ─── AI Chat ────────────────────────────────────────────────────────────────

export const chat = asyncHandler(async (req, res) => {
  const { message, conversationId, projectId } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 1) {
    return res.status(400).json(new ApiResponse(400, 'Message is required.'));
  }

  const result = await aiService.chat({
    message: message.trim(),
    conversationId,
    workspaceId: req.params.workspaceId,
    projectId,
    organizationId: req.params.orgId,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, 'AI response generated.', result));
});

export const listConversations = asyncHandler(async (req, res) => {
  const { page, limit, projectId } = req.query;
  const result = await aiService.listConversations(
    req.params.workspaceId,
    req.user._id,
    { page, limit, projectId },
  );
  res.status(200).json(new ApiResponse(200, 'Conversations retrieved.', result));
});

export const getConversation = asyncHandler(async (req, res) => {
  const conversation = await aiService.getConversation(req.params.conversationId);
  res.status(200).json(new ApiResponse(200, 'Conversation retrieved.', { conversation }));
});

// ─── Task Intelligence ──────────────────────────────────────────────────────

export const generateTaskDescription = asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json(new ApiResponse(400, 'Task title is required.'));

  const result = await aiService.generateTaskDescription(
    title,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Task description generated.', result));
});

export const generateSubtasks = asyncHandler(async (req, res) => {
  const result = await aiService.generateSubtasks(
    req.body,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Subtasks generated.', result));
});

export const estimateStoryPoints = asyncHandler(async (req, res) => {
  const result = await aiService.estimateStoryPoints(
    req.body,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Story points estimated.', result));
});

export const detectBlockers = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json(new ApiResponse(400, 'Project ID is required.'));

  const result = await aiService.detectBlockers(
    req.body,
    projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Blocker analysis complete.', result));
});

// ─── Sprint Intelligence ────────────────────────────────────────────────────

export const suggestSprintGoal = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json(new ApiResponse(400, 'Project ID is required.'));

  const result = await aiService.suggestSprintGoal(
    projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Sprint goal suggested.', result));
});

export const predictSprintRisk = asyncHandler(async (req, res) => {
  const { sprintId } = req.body;
  if (!sprintId) return res.status(400).json(new ApiResponse(400, 'Sprint ID is required.'));

  const result = await aiService.predictSprintRisk(
    sprintId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Sprint risk predicted.', result));
});

// ─── Project Intelligence ───────────────────────────────────────────────────

export const projectHealthReport = asyncHandler(async (req, res) => {
  const { projectId } = req.body;
  if (!projectId) return res.status(400).json(new ApiResponse(400, 'Project ID is required.'));

  const result = await aiService.generateProjectHealthReport(
    projectId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Project health report generated.', result));
});

// ─── Documentation ──────────────────────────────────────────────────────────

export const generateDocument = asyncHandler(async (req, res) => {
  const { type, context } = req.body;
  if (!type || !context) {
    return res.status(400).json(new ApiResponse(400, 'Document type and context are required.'));
  }

  const result = await aiService.generateDocument(
    type,
    context,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Document generated.', result));
});

// ─── Smart Search ───────────────────────────────────────────────────────────

export const smartSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json(new ApiResponse(400, 'Search query is required.'));

  const result = await aiService.smartSearch(
    query,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Smart search complete.', result));
});

// ─── AI Logs & Usage ────────────────────────────────────────────────────────

export const getAiLogs = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await aiService.getAiLogs(req.params.workspaceId, { page, limit });
  res.status(200).json(new ApiResponse(200, 'AI logs retrieved.', { docs: result.data, meta: result.meta }));
});

export const getTokenUsage = asyncHandler(async (req, res) => {
  const usage = await aiService.getTokenUsage(req.params.workspaceId);
  res.status(200).json(new ApiResponse(200, 'Token usage retrieved.', { usage }));
});
