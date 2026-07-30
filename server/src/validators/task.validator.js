import { ApiError } from '../utils/apiError.js';
import { TASK_STATUS, PRIORITY } from '../constants/statuses.js';

export const validateCreateTask = (req, res, next) => {
  const { title, status, priority, type, startDate, dueDate, estimatedHours } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 2) {
    return next(ApiError.badRequest('Task title is required and must be at least 2 characters long.'));
  }

  if (status && !Object.values(TASK_STATUS).includes(status)) {
    return next(ApiError.badRequest(`Invalid task status. Must be one of: ${Object.values(TASK_STATUS).join(', ')}`));
  }

  if (priority && !Object.values(PRIORITY).includes(priority)) {
    return next(ApiError.badRequest(`Invalid priority. Must be one of: ${Object.values(PRIORITY).join(', ')}`));
  }

  if (type && !['story', 'task', 'bug', 'epic', 'improvement'].includes(type)) {
    return next(ApiError.badRequest('Invalid task type. Must be story, task, bug, epic, or improvement.'));
  }

  if (startDate && dueDate) {
    const start = new Date(startDate);
    const due = new Date(dueDate);
    if (isNaN(start.getTime()) || isNaN(due.getTime())) {
      return next(ApiError.badRequest('Invalid start or due date format.'));
    }
    if (start > due) {
      return next(ApiError.badRequest('Task start date cannot be after due date.'));
    }
  }

  if (estimatedHours !== undefined && (typeof estimatedHours !== 'number' || estimatedHours < 0)) {
    return next(ApiError.badRequest('Estimated hours must be a non-negative number.'));
  }

  next();
};

export const validateUpdateTask = (req, res, next) => {
  const { title, status, priority, type, startDate, dueDate, estimatedHours } = req.body;

  if (title !== undefined && (typeof title !== 'string' || title.trim().length < 2)) {
    return next(ApiError.badRequest('Task title must be at least 2 characters long.'));
  }

  if (status && !Object.values(TASK_STATUS).includes(status)) {
    return next(ApiError.badRequest(`Invalid task status. Must be one of: ${Object.values(TASK_STATUS).join(', ')}`));
  }

  if (priority && !Object.values(PRIORITY).includes(priority)) {
    return next(ApiError.badRequest(`Invalid priority. Must be one of: ${Object.values(PRIORITY).join(', ')}`));
  }

  if (type && !['story', 'task', 'bug', 'epic', 'improvement'].includes(type)) {
    return next(ApiError.badRequest('Invalid task type. Must be story, task, bug, epic, or improvement.'));
  }

  if (startDate || dueDate) {
    const start = startDate ? new Date(startDate) : null;
    const due = dueDate ? new Date(dueDate) : null;

    if ((start && isNaN(start.getTime())) || (due && isNaN(due.getTime()))) {
      return next(ApiError.badRequest('Invalid start or due date format.'));
    }
    if (start && due && start > due) {
      return next(ApiError.badRequest('Task start date cannot be after due date.'));
    }
  }

  if (estimatedHours !== undefined && (typeof estimatedHours !== 'number' || estimatedHours < 0)) {
    return next(ApiError.badRequest('Estimated hours must be a non-negative number.'));
  }

  next();
};
