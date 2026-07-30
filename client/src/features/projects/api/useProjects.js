import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

const cleanId = (id) => (typeof id === 'string' && /^[a-f\d]{24}$/i.test(id) ? id : null);

/**
 * Fetch projects for a workspace with query params (search, status, visibility, sort, page, isArchived, isFavorite).
 */
export const useProjects = (organizationId, workspaceId, params = {}) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['projects', activeOrgId, activeWsId || 'auto', params],
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

      if (!targetWsId) return { docs: [], totalDocs: 0 };

      // Sanitize params so empty strings and false booleans (like isFavorite: false) are omitted
      const cleanedParams = {};
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, val]) => {
          if (val !== '' && val !== null && val !== undefined) {
            if (typeof val === 'boolean') {
              if (val === true) cleanedParams[key] = 'true';
            } else {
              cleanedParams[key] = val;
            }
          }
        });
      }

      // apiClient interceptor already returns response.data (the API envelope).
      // The actual pagination payload lives at envelope.data.
      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/projects`,
        { params: cleanedParams },
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
    enabled: !!activeOrgId,
  });
};

/**
 * Fetch detailed single project by ID.
 */
export const useProjectDetails = (organizationId, workspaceId, projectId) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['project', activeOrgId, activeWsId || 'auto', projectId],
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

      if (!targetWsId) return null;

      // apiClient interceptor already returns response.data (the envelope).
      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/projects/${projectId}`,
      );
      return envelope?.data?.project ?? null;
    },
    enabled: !!activeOrgId && !!projectId,
  });
};

/**
 * Fetch project activity logs stream.
 */
export const useProjectActivity = (organizationId, workspaceId, projectId) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

  return useQuery({
    queryKey: ['project-activity', activeOrgId, activeWsId || 'auto', projectId],
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

      if (!targetWsId) return [];

      // apiClient interceptor already returns response.data (the envelope).
      const envelope = await apiClient.get(
        `/organizations/${activeOrgId}/workspaces/${targetWsId}/projects/${projectId}/activity`,
      );
      return envelope?.data?.activities ?? [];
    },
    enabled: !!activeOrgId && !!projectId,
  });
};

/**
 * Create a new Project.
 */
export const useCreateProject = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      let activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));

      if (!activeWsId && activeOrgId) {
        // apiClient interceptor already returns response.data (the envelope).
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

      // apiClient interceptor already returns response.data (the envelope).
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects`,
        payload,
      );
      return envelope?.data?.project;
    },
    onSuccess: (newProject) => {
      // Invalidate + force-refetch ALL project list queries (bypasses staleTime).
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      queryClient.refetchQueries({ queryKey: ['projects'], type: 'all' });
      toast.success('Project created successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to create project.');
    },
  });
};

/**
 * Update Project details.
 */
export const useUpdateProject = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, payload }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.patch(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}`,
        payload,
      );
      return envelope?.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['project'], refetchType: 'all' });
      toast.success('Project updated successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update project.');
    },
  });
};

/**
 * Archive Project.
 */
export const useArchiveProject = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/archive`,
      );
      return envelope?.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      toast.success('Project archived successfully.');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to archive project.');
    },
  });
};

/**
 * Restore Project.
 */
export const useRestoreProject = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/restore`,
      );
      return envelope?.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      toast.success('Project restored successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to restore project.');
    },
  });
};

/**
 * Toggle Favorite Project with Optimistic Updates.
 */
export const useToggleFavoriteProject = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/favorite`,
      );
      // Server returns { isFavorited, project } inside envelope.data
      return envelope?.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      toast.success(data?.isFavorited ? 'Project added to favorites ⭐' : 'Project removed from favorites');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update favorite status.');
    },
  });
};

/**
 * Duplicate Project.
 */
export const useDuplicateProject = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, name, key }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/duplicate`,
        { name, key },
      );
      return envelope?.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      toast.success('Project duplicated successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to duplicate project.');
    },
  });
};

/**
 * Add Member to Project.
 */
export const useAddProjectMember = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.post(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/members`,
        { userId, role },
      );
      return envelope?.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Member added to project!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to add member to project.');
    },
  });
};

/**
 * Remove Member from Project.
 */
export const useRemoveProjectMember = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.delete(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/members/${userId}`,
      );
      return envelope?.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Member removed from project.');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to remove member.');
    },
  });
};

/**
 * Update Member Role in Project.
 */
export const useUpdateProjectMemberRole = (organizationId, workspaceId, projectId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      const envelope = await apiClient.patch(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}/members/${userId}`,
        { role },
      );
      return envelope?.data?.project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project'] });
      toast.success('Member role updated!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update member role.');
    },
  });
};

/**
 * Delete Project.
 */
export const useDeleteProject = (organizationId, workspaceId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const activeWsId = cleanId(workspaceId) || cleanId(localStorage.getItem('nexora_workspace_id'));
      await apiClient.delete(
        `/organizations/${activeOrgId}/workspaces/${activeWsId}/projects/${projectId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      toast.success('Project deleted successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to delete project.');
    },
  });
};
