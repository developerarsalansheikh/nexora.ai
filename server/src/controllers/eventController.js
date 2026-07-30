import { EventService } from '../services/EventService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const eventService = new EventService();

export const create = asyncHandler(async (req, res) => {
  const event = await eventService.create(
    req.body,
    req.params.workspaceId,
    req.params.orgId,
    req.user._id,
  );
  res.status(201).json(new ApiResponse(201, 'Calendar event created.', { event }));
});

export const getUnifiedEvents = asyncHandler(async (req, res) => {
  const { startDate, endDate, projectId, type } = req.query;

  if (!startDate || !endDate) {
    res.status(400).json(new ApiResponse(400, 'Both startDate and endDate query parameters are required.'));
    return;
  }

  let workspaceId = req.params.workspaceId;
  if (!workspaceId || workspaceId === 'undefined' || workspaceId === 'null') {
    const Workspace = (await import('../models/Workspace.js')).default;
    const defaultWs = await Workspace.findOne({ organizationId: req.params.orgId, deletedAt: null });
    if (defaultWs) workspaceId = defaultWs._id.toString();
  }

  const events = await eventService.getUnifiedCalendarEvents(
    workspaceId,
    startDate,
    endDate,
    { projectId, type, userId: req.user._id },
  );

  res.status(200).json(new ApiResponse(200, 'Unified calendar events retrieved.', { events }));
});

export const getById = asyncHandler(async (req, res) => {
  const event = await eventService.getById(req.params.eventId, req.params.orgId);
  res.status(200).json(new ApiResponse(200, 'Calendar event retrieved.', { event }));
});

export const update = asyncHandler(async (req, res) => {
  const event = await eventService.update(
    req.params.eventId,
    req.params.orgId,
    req.params.workspaceId,
    req.body,
    req.user._id,
  );
  res.status(200).json(new ApiResponse(200, 'Calendar event updated.', { event }));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  await eventService.delete(
    req.params.eventId,
    req.params.orgId,
    req.params.workspaceId,
    req.user._id,
  );
  res.status(204).send();
});
