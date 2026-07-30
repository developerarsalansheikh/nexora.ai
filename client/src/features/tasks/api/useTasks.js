import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

const cleanId = (id) => (typeof id === 'string' && /^[a-f\d]{24}$/i.test(id) ? id : null);

/**
 * Fetch tasks for a project with params (search, status, priority, type, assignee, sort, page).
 */
export const useTasks = (organizationId, workspaceId, projectId, params = {}) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['tasks', activeOrgId, activeWsId || 'auto', projectId, params],
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

      if (!targetWsId || !projectId) return { docs: [], totalDocs: 0 };

      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/projects/${projectId}/tasks`,
        { params },
      );

      const dataPayload = envelope?.data?.docs
        ? envelope.data
        : envelope?.docs
        ? envelope
        : Array.isArray(envelope?.data)
        ? { docs: envelope.data, totalDocs: envelope.data.length }
        : Array.isArray(envelope)
        ? { docs: envelope, totalDocs: envelope.length }
        : envelope?.data ?? envelope ?? {};

      return dataPayload;
    },
    enabled: !!activeOrgId && !!projectId,
  });
};

/**
 * Fetch single detailed task by ID.
 */
export const useTaskDetails = (organizationId, workspaceId, projectId, taskId) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['task', activeOrgId, activeWsId || 'auto', projectId, taskId],
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

      if (!targetWsId || !projectId || !taskId) return null;

      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/projects/${projectId}/tasks/${taskId}`,
      );
      return envelope?.data?.task ?? envelope?.task ?? null;
    },
    enabled: !!activeOrgId && !!projectId && !!taskId,
  });
};

/**
 * Fetch subtasks for a task.
 */
export const useSubTasks = (organizationId, workspaceId, projectId, taskId) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['subtasks', activeOrgId, activeWsId || 'auto', projectId, taskId],
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

      if (!targetWsId || !projectId || !taskId) return [];

      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/projects/${projectId}/tasks/${taskId}/subtasks`,
      );
      return envelope?.data?.docs || envelope?.docs || [];
    },
    enabled: !!activeOrgId && !!projectId && !!taskId,
  });
};

/**
 * Fetch comments for a task.
 */
export const useTaskComments = (organizationId, workspaceId, projectId, taskId) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['task-comments', activeOrgId, activeWsId || 'auto', projectId, taskId],
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

      if (!targetWsId || !projectId || !taskId) return [];

      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/projects/${projectId}/tasks/${taskId}/comments`,
      );
      return envelope?.data?.docs || envelope?.docs || [];
    },
    enabled: !!activeOrgId && !!projectId && !!taskId,
  });
};

/**
 * Create a new Task.
 */
export const useCreateTask = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      let activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

      if (!activeWsId && activeOrgId) {
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
          activeWsId = list[0]._id;
          localStorage.setItem('nexora_workspace_id', activeWsId);
        }
      }

      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks`,
        payload,
      );
      return envelope?.data?.task ?? envelope?.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' });
      queryClient.refetchQueries({ queryKey: ['tasks'], type: 'all' });
      toast.success('Task created successfully! 🎉');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create task.');
    },
  });
};

/**
 * Update a Task.
 */
export const useUpdateTask = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId, payload }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.patch(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}`,
        payload,
      );
      return envelope?.data?.task ?? envelope?.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['task'], refetchType: 'all' });
      toast.success('Task updated!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update task.');
    },
  });
};

/**
 * Reorder Tasks / Kanban Drag-and-Drop persistence with optimistic updates.
 */
export const useReorderTasks = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (items) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.patch(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/reorder`,
        { items },
      );
      return envelope?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' });
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to save task position.');
    },
  });
};

/**
 * Add time tracking work log.
 */
export const useAddWorkLog = (organizationId, workspaceId, projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ hours, comment }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}/worklog`,
        { hours, comment },
      );
      return envelope?.data?.task ?? envelope?.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'], refetchType: 'all' });
      toast.success('Work log added!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to log hours.');
    },
  });
};

/**
 * Toggle Watcher.
 */
export const useToggleWatcher = (organizationId, workspaceId, projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}/watch`,
      );
      return envelope?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['task'], refetchType: 'all' });
      toast.success(data?.isWatching ? 'Started watching task 👁️' : 'Stopped watching task');
    },
  });
};

/**
 * Add Dependency (with cyclic dependency error handling).
 */
export const useAddDependency = (organizationId, workspaceId, projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targetTaskId, type }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}/dependencies`,
        { targetTaskId, type },
      );
      return envelope?.data?.task ?? envelope?.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'], refetchType: 'all' });
      toast.success('Dependency added!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to add dependency.');
    },
  });
};

/**
 * Toggle Checklist Item.
 */
export const useToggleChecklistItem = (organizationId, workspaceId, projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, completed }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.patch(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}/checklist`,
        { itemId, completed },
      );
      return envelope?.data?.task ?? envelope?.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'], refetchType: 'all' });
    },
  });
};

/**
 * Add Checklist Item.
 */
export const useAddChecklistItem = (organizationId, workspaceId, projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}/checklist`,
        { title },
      );
      return envelope?.data?.task ?? envelope?.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task'], refetchType: 'all' });
      toast.success('Checklist item added!');
    },
  });
};

/**
 * Add Comment to Task.
 */
export const useAddComment = (organizationId, workspaceId, projectId, taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}/comments`,
        { content },
      );
      return envelope?.data?.comment ?? envelope?.comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-comments'], refetchType: 'all' });
      toast.success('Comment posted!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to post comment.');
    },
  });
};

/**
 * Delete Task.
 */
export const useDeleteTask = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (taskId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      await apiClient.delete(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/tasks/${taskId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'], refetchType: 'all' });
      toast.success('Task deleted successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete task.');
    },
  });
};
