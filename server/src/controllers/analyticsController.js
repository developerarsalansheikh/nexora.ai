import analyticsService from '../services/AnalyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, projectId, range } = req.query;
  const analytics = await analyticsService.getWorkspaceAnalytics(req.params.workspaceId, {
    startDate,
    endDate,
    projectId,
    range,
  });
  res.status(200).json(new ApiResponse(200, 'Analytics retrieved.', { analytics }));
});
