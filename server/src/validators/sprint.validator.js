import { ApiError } from '../utils/apiError.js';
import { SPRINT_STATUS } from '../constants/statuses.js';

export const validateCreateSprint = (req, res, next) => {
  const { name, startDate, endDate, goal } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(ApiError.badRequest('Sprint name is required and must be at least 2 characters.'));
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(ApiError.badRequest('Invalid start or end date format.'));
    }
    if (start > end) {
      return next(ApiError.badRequest('Sprint start date cannot be after end date.'));
    }
  }

  next();
};

export const validateUpdateSprint = (req, res, next) => {
  const { name, status, startDate, endDate } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return next(ApiError.badRequest('Sprint name must be at least 2 characters.'));
  }

  if (status && !Object.values(SPRINT_STATUS).includes(status)) {
    return next(ApiError.badRequest(`Invalid sprint status. Must be one of: ${Object.values(SPRINT_STATUS).join(', ')}`));
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) {
      return next(ApiError.badRequest('Invalid start or end date format.'));
    }
    if (start && end && start > end) {
      return next(ApiError.badRequest('Sprint start date cannot be after end date.'));
    }
  }

  next();
};
