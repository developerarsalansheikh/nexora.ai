import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

/**
 * Build the base AI API path.
 */
const aiPath = (orgId, wsId) => `/organizations/${orgId}/workspaces/${wsId}/ai`;

// ─── Chat Hooks ─────────────────────────────────────────────────────────────

export const useAiChat = (orgId, wsId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ message, conversationId, projectId }) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/chat`, {
        message,
        conversationId,
        projectId,
      });
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations', orgId, wsId] });
    },
    onError: (err) => {
      toast.error(err?.message || 'AI chat failed.');
    },
  });
};

export const useConversations = (orgId, wsId, options = {}) => {
  return useQuery({
    queryKey: ['ai-conversations', orgId, wsId, options.projectId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.projectId) params.append('projectId', options.projectId);
      if (options.page) params.append('page', options.page);
      const res = await apiClient.get(`${aiPath(orgId, wsId)}/conversations?${params}`);
      return res ?? { docs: [] };
    },
    enabled: !!orgId && !!wsId,
  });
};

export const useConversation = (orgId, wsId, conversationId) => {
  return useQuery({
    queryKey: ['ai-conversation', conversationId],
    queryFn: async () => {
      const res = await apiClient.get(`${aiPath(orgId, wsId)}/conversations/${conversationId}`);
      return res.data?.conversation ?? null;
    },
    enabled: !!orgId && !!wsId && !!conversationId,
  });
};

// ─── Task Intelligence Hooks ────────────────────────────────────────────────

export const useGenerateTaskDescription = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (title) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/tasks/generate-description`, { title });
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to generate description.');
    },
  });
};

export const useGenerateSubtasks = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (taskData) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/tasks/generate-subtasks`, taskData);
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to generate subtasks.');
    },
  });
};

export const useEstimateStoryPoints = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (taskData) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/tasks/estimate-points`, taskData);
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to estimate story points.');
    },
  });
};

export const useDetectBlockers = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (taskData) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/tasks/detect-blockers`, taskData);
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to detect blockers.');
    },
  });
};

// ─── Sprint Intelligence Hooks ──────────────────────────────────────────────

export const useSuggestSprintGoal = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (projectId) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/sprints/suggest-goal`, { projectId });
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to suggest sprint goal.');
    },
  });
};

export const usePredictSprintRisk = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (sprintId) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/sprints/predict-risk`, { sprintId });
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to predict sprint risk.');
    },
  });
};

// ─── Project Intelligence Hooks ─────────────────────────────────────────────

export const useProjectHealthReport = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (projectId) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/projects/health-report`, { projectId });
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to generate project health report.');
    },
  });
};

// ─── Document Generation Hooks ──────────────────────────────────────────────

export const useGenerateDocument = (orgId, wsId) => {
  return useMutation({
    mutationFn: async ({ type, context }) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/documents/generate`, { type, context });
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to generate document.');
    },
  });
};

// ─── Smart Search Hooks ─────────────────────────────────────────────────────

export const useSmartSearch = (orgId, wsId) => {
  return useMutation({
    mutationFn: async (query) => {
      const res = await apiClient.post(`${aiPath(orgId, wsId)}/search`, { query });
      return res?.data ?? res;
    },
    onError: (err) => {
      toast.error(err?.message || 'Smart search failed.');
    },
  });
};

// ─── AI Logs & Usage Hooks ──────────────────────────────────────────────────

export const useAiLogs = (orgId, wsId, options = {}) => {
  return useQuery({
    queryKey: ['ai-logs', orgId, wsId, options.page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      if (options.limit) params.append('limit', options.limit);
      const res = await apiClient.get(`${aiPath(orgId, wsId)}/logs?${params}`);
      const payload = res?.data ?? res;
      if (Array.isArray(payload)) return { docs: payload };
      return payload?.docs ? payload : { docs: payload?.logs ?? (Array.isArray(payload) ? payload : []) };
    },
    enabled: !!orgId && !!wsId,
  });
};

export const useTokenUsage = (orgId, wsId) => {
  return useQuery({
    queryKey: ['ai-token-usage', orgId, wsId],
    queryFn: async () => {
      const res = await apiClient.get(`${aiPath(orgId, wsId)}/usage`);
      const payload = res?.data ?? res;
      return payload?.usage ?? payload ?? {};
    },
    enabled: !!orgId && !!wsId,
  });
};
