import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

const notifPath = (orgId, wsId) => `/organizations/${orgId}/workspaces/${wsId}/notifications`;

export const useNotifications = (orgId, wsId, options = {}) => {
  return useQuery({
    queryKey: ['notifications', orgId, wsId, options.status, options.page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      const res = await apiClient.get(`${notifPath(orgId, wsId)}?${params}`);
      return res.data ?? { docs: [] };
    },
    enabled: !!orgId && !!wsId,
    refetchInterval: 15000, // Poll every 15s for real-time unread badge
  });
};

export const useMarkNotificationRead = (orgId, wsId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId) => {
      const res = await apiClient.patch(`${notifPath(orgId, wsId)}/${notificationId}/read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId, wsId] });
    },
  });
};

export const useMarkAllNotificationsRead = (orgId, wsId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.patch(`${notifPath(orgId, wsId)}/mark-all-read`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId, wsId] });
      toast.success('All notifications marked as read.');
    },
  });
};

export const useArchiveNotification = (orgId, wsId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId) => {
      const res = await apiClient.patch(`${notifPath(orgId, wsId)}/${notificationId}/archive`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId, wsId] });
      toast.success('Notification archived.');
    },
  });
};

export const useDeleteNotification = (orgId, wsId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId) => {
      await apiClient.delete(`${notifPath(orgId, wsId)}/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', orgId, wsId] });
      toast.success('Notification deleted.');
    },
  });
};

export const useNotificationPreferences = (orgId, wsId) => {
  return useQuery({
    queryKey: ['notification-preferences', orgId, wsId],
    queryFn: async () => {
      const res = await apiClient.get(`${notifPath(orgId, wsId)}/preferences`);
      return res.data?.preferences ?? {};
    },
    enabled: !!orgId && !!wsId,
  });
};

export const useUpdateNotificationPreferences = (orgId, wsId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferencesData) => {
      const res = await apiClient.put(`${notifPath(orgId, wsId)}/preferences`, preferencesData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', orgId, wsId] });
      toast.success('Notification preferences updated.');
    },
  });
};
