import { ApiError } from '../utils/apiError.js';
import { VISIBILITY, PROJECT_STATUS } from '../constants/statuses.js';

export const validateCreateProject = (req, res, next) => {
  const { name, key, visibility, status, startDate, endDate } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(ApiError.badRequest('Project name is required and must be at least 2 characters long.'));
  }

  if (!key || typeof key !== 'string' || key.trim().length < 2 || key.trim().length > 10) {
    return next(ApiError.badRequest('Project key is required and must be between 2 and 10 characters long.'));
  }

  const cleanKey = key.trim().toUpperCase();
  if (!/^[A-Z0-9_-]+$/.test(cleanKey)) {
    return next(ApiError.badRequest('Project key must only contain uppercase letters, numbers, hyphens, or underscores.'));
  }
  req.body.key = cleanKey;

  if (visibility && !Object.values(VISIBILITY).includes(visibility)) {
    return next(ApiError.badRequest(`Invalid visibility. Must be one of: ${Object.values(VISIBILITY).join(', ')}`));
  }

  if (status && !Object.values(PROJECT_STATUS).includes(status)) {
    return next(ApiError.badRequest(`Invalid project status. Must be one of: ${Object.values(PROJECT_STATUS).join(', ')}`));
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(ApiError.badRequest('Invalid start or end date format.'));
    }
    if (start > end) {
      return next(ApiError.badRequest('Project start date cannot be after the end date.'));
    }
  }

  next();
};

export const validateUpdateProject = (req, res, next) => {
  const { name, key, visibility, status, startDate, endDate } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    return next(ApiError.badRequest('Project name must be at least 2 characters long.'));
  }

  if (key !== undefined) {
    if (typeof key !== 'string' || key.trim().length < 2 || key.trim().length > 10) {
      return next(ApiError.badRequest('Project key must be between 2 and 10 characters long.'));
    }
    const cleanKey = key.trim().toUpperCase();
    if (!/^[A-Z0-9_-]+$/.test(cleanKey)) {
      return next(ApiError.badRequest('Project key must only contain uppercase letters, numbers, hyphens, or underscores.'));
    }
    req.body.key = cleanKey;
  }

  if (visibility && !Object.values(VISIBILITY).includes(visibility)) {
    return next(ApiError.badRequest(`Invalid visibility. Must be one of: ${Object.values(VISIBILITY).join(', ')}`));
  }

  if (status && !Object.values(PROJECT_STATUS).includes(status)) {
    return next(ApiError.badRequest(`Invalid project status. Must be one of: ${Object.values(PROJECT_STATUS).join(', ')}`));
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) {
      return next(ApiError.badRequest('Invalid start or end date format.'));
    }
    if (start && end && start > end) {
      return next(ApiError.badRequest('Project start date cannot be after the end date.'));
    }
  }

  next();
};
