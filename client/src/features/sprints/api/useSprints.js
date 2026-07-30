import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

/**
 * Fetch all sprints in a project.
 */
export const useSprints = (organizationId, workspaceId, projectId, params = {}) => {
  return useQuery({
    queryKey: ['sprints', organizationId, workspaceId, projectId, params],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints`,
        { params },
      );
      return data ?? {}; // paginated { docs, totalDocs }
    },
    enabled: !!organizationId && !!workspaceId && !!projectId,
  });
};

/**
 * Fetch active sprint in a project.
 */
export const useActiveSprint = (organizationId, workspaceId, projectId) => {
  return useQuery({
    queryKey: ['active-sprint', organizationId, workspaceId, projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints/active`,
      );
      return data?.sprint ?? null;
    },
    enabled: !!organizationId && !!workspaceId && !!projectId,
  });
};

/**
 * Fetch burndown data for a sprint.
 */
export const useSprintBurndown = (organizationId, workspaceId, projectId, sprintId) => {
  return useQuery({
    queryKey: ['sprint-burndown', organizationId, workspaceId, projectId, sprintId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/burndown`,
      );
      return data?.burndown ?? [];
    },
    enabled: !!organizationId && !!workspaceId && !!projectId && !!sprintId,
  });
};

/**
 * Fetch historical velocity data for a project.
 */
export const useVelocityChart = (organizationId, workspaceId, projectId) => {
  return useQuery({
    queryKey: ['velocity-chart', organizationId, workspaceId, projectId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints/velocity`,
      );
      return data?.velocity ?? [];
    },
    enabled: !!organizationId && !!workspaceId && !!projectId,
  });
};

/**
 * Create a new planned sprint.
 */
export const useCreateSprint = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints`,
        payload,
      );
      return data?.sprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', organizationId, workspaceId, projectId] });
      toast.success('Sprint created!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create sprint.');
    },
  });
};

/**
 * Start a planned sprint (enforces single active sprint).
 */
export const useStartSprint = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sprintId) => {
      const { data } = await apiClient.post(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/start`,
      );
      return data?.sprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', organizationId, workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['active-sprint', organizationId, workspaceId, projectId] });
      toast.success('Sprint started! 🏃');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to start sprint.');
    },
  });
};

/**
 * Complete an active sprint.
 */
export const useCompleteSprint = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sprintId, moveToSprintId }) => {
      const { data } = await apiClient.post(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/complete`,
        { moveToSprintId },
      );
      return data?.sprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', organizationId, workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['active-sprint', organizationId, workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', organizationId, workspaceId, projectId] });
      toast.success('Sprint completed! 🎉');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to complete sprint.');
    },
  });
};

/**
 * Move tasks into a sprint (or backlog).
 */
export const useMoveTasksToSprint = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sprintId, taskIds }) => {
      const { data } = await apiClient.post(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/tasks`,
        { taskIds },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', organizationId, workspaceId, projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', organizationId, workspaceId, projectId] });
      toast.success('Tasks assigned to sprint!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to move tasks.');
    },
  });
};

/**
 * Update sprint retrospective notes.
 */
export const useUpdateRetrospective = (organizationId, workspaceId, projectId, sprintId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (retrospective) => {
      const { data } = await apiClient.patch(
        `/organizations/${organizationId}/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/retrospective`,
        retrospective,
      );
      return data?.sprint;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', organizationId, workspaceId, projectId] });
      toast.success('Retrospective notes saved!');
    },
  });
};
