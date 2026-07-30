import { ApiError } from '../utils/apiError.js';

export const validateCreateEvent = (req, res, next) => {
  const { title, type, startDate, endDate } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return next(ApiError.badRequest('Event title is required and must be at least 2 characters.'));
  }

  if (type && !['event', 'milestone', 'deadline', 'sprint', 'personal'].includes(type)) {
    return next(ApiError.badRequest('Invalid event type. Must be event, milestone, deadline, sprint, or personal.'));
  }

  if (!startDate || !endDate) {
    return next(ApiError.badRequest('Both start date and end date are required.'));
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return next(ApiError.badRequest('Invalid start or end date format.'));
  }
  if (start > end) {
    return next(ApiError.badRequest('Event start date cannot be after end date.'));
  }

  next();
};

export const validateUpdateEvent = (req, res, next) => {
  const { title, type, startDate, endDate } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2)) {
    return next(ApiError.badRequest('Event title must be at least 2 characters.'));
  }

  if (type && !['event', 'milestone', 'deadline', 'sprint', 'personal'].includes(type)) {
    return next(ApiError.badRequest('Invalid event type.'));
  }

  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if ((start && isNaN(start.getTime())) || (end && isNaN(end.getTime()))) {
      return next(ApiError.badRequest('Invalid start or end date format.'));
    }
    if (start && end && start > end) {
      return next(ApiError.badRequest('Event start date cannot be after end date.'));
    }
  }

  next();
};
