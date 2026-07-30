import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

const cleanId = (id) => (typeof id === 'string' && /^[a-f\d]{24}$/i.test(id) ? id : null);

/**
 * Fetch unified calendar events (custom events, milestones, task deadlines, sprint dates).
 */
export const useUnifiedCalendar = (organizationId, workspaceId, startDate, endDate, options = {}) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['unified-calendar', activeOrgId, activeWsId || 'auto', startDate, endDate, options],
    queryFn: async () => {
      let targetWsId = activeWsId;
      if (!targetWsId && activeOrgId) {
        try {
          const wsEnvelope = await apiClient.get(`/organizations/${activeOrgId}/workspaces`);
          const wsPayload = wsEnvelope?.data;
          const list = Array.isArray(wsPayload)
            ? wsPayload
            : Array.isArray(wsPayload?.docs)
            ? wsPayload.docs
            : Array.isArray(wsPayload?.data)
            ? wsPayload.data
            : [];
          if (list.length > 0) {
            targetWsId = list[0]._id;
            localStorage.setItem('nexora_workspace_id', targetWsId);
          }
        } catch (e) {
          console.error('Failed to auto-resolve workspace ID:', e);
        }
      }

      if (!targetWsId || !startDate || !endDate) return [];

      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/events`,
        {
          params: {
            startDate,
            endDate,
            ...options,
          },
        },
      );
      return envelope?.data?.events ?? envelope?.events ?? (Array.isArray(envelope?.data) ? envelope.data : []);
    },
    enabled: !!activeOrgId && !!startDate && !!endDate,
  });
};

/**
 * Create a new calendar event or milestone.
 */
export const useCreateEvent = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      let activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

      if (!activeWsId && activeOrgId) {
        const wsEnvelope = await apiClient.get(`/organizations/${activeOrgId}/workspaces`);
        const wsPayload = wsEnvelope?.data;
        const list = Array.isArray(wsPayload) ? wsPayload
          : Array.isArray(wsPayload?.docs) ? wsPayload.docs
          : Array.isArray(wsPayload?.data) ? wsPayload.data
          : [];
        if (list.length > 0) {
          activeWsId = list[0]._id;
          localStorage.setItem('nexora_workspace_id', activeWsId);
        }
      }

      if (!activeOrgId || !activeWsId) {
        throw new Error('Workspace context missing. Please select a workspace.');
      }

      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/events`,
        payload,
      );
      return envelope?.data?.event ?? envelope?.event ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-calendar'], refetchType: 'all' });
      queryClient.refetchQueries({ queryKey: ['unified-calendar'], type: 'all' });
      toast.success('Calendar event created! 📅');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create event.');
    },
  });
};

/**
 * Update a calendar event.
 */
export const useUpdateEvent = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, payload }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.patch(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/events/${eventId}`,
        payload,
      );
      return envelope?.data?.event ?? envelope?.event ?? null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-calendar'], refetchType: 'all' });
      toast.success('Calendar event updated!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update event.');
    },
  });
};

/**
 * Delete a calendar event.
 */
export const useDeleteEvent = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      await apiClient.delete(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/events/${eventId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-calendar'], refetchType: 'all' });
      toast.success('Event deleted!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete event.');
    },
  });
};
