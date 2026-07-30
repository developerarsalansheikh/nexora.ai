import notificationService from '../services/NotificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, status, type } = req.query;
  const result = await notificationService.getUserNotifications(req.user._id, {
    page,
    limit,
    status,
    type,
  });
  res.status(200).json(new ApiResponse(200, 'Notifications retrieved.', result));
});

export const markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.notificationId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Notification marked as read.', { notification: result }));
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, 'All notifications marked as read.'));
});

export const archiveNotification = asyncHandler(async (req, res) => {
  const result = await notificationService.archiveNotification(req.params.notificationId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Notification archived.', { notification: result }));
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.notificationId, req.user._id);
  res.status(200).json(new ApiResponse(200, 'Notification deleted.'));
});

export const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.getPreferences(req.user._id);
  res.status(200).json(new ApiResponse(200, 'Preferences retrieved.', { preferences }));
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await notificationService.updatePreferences(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, 'Preferences updated.', { preferences }));
});
