import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

const cleanId = (id) => (typeof id === 'string' && /^[a-f\d]{24}$/i.test(id) ? id : null);

export const useWorkspaces = (organizationId) => {
  const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
  return useQuery({
    queryKey: ['workspaces', activeOrgId],
    queryFn: async () => {
      const res = await apiClient.get(`/organizations/${activeOrgId}/workspaces`);
      // Axios interceptor returns { statusCode, success, message, data }
      // WorkspaceController wraps BaseRepository result in ApiResponse → data = { data: [...], meta: {} }
      const envelope = res?.data ?? res;
      let list = [];
      if (Array.isArray(envelope)) list = envelope;
      else if (Array.isArray(envelope?.data)) list = envelope.data;       // BaseRepository shape
      else if (Array.isArray(envelope?.docs)) list = envelope.docs;       // paginated shape
      else if (Array.isArray(envelope?.workspaces)) list = envelope.workspaces;

      if (list.length > 0 && !cleanId(localStorage.getItem('nexora_workspace_id'))) {
        localStorage.setItem('nexora_workspace_id', list[0]._id);
      }
      return list;
    },
    enabled: !!activeOrgId,
  });
};

export const useCreateWorkspace = (organizationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      if (!activeOrgId) {
        throw new Error('Organization context missing.');
      }
      const { data } = await apiClient.post(`/organizations/${activeOrgId}/workspaces`, payload);
      return data;
    },
    onSuccess: (res) => {
      // ApiResponse: { statusCode, success, message, data: { workspace: {...} } }
      const newWs = res?.workspace || res?.data?.workspace || res;
      if (newWs?._id) {
        localStorage.setItem('nexora_workspace_id', newWs._id);
      }
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Workspace created successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to create workspace.');
    },
  });
};

export const useUpdateWorkspace = (organizationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ workspaceId, payload }) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      const { data } = await apiClient.patch(
        `/organizations/${activeOrgId}/workspaces/${workspaceId}`,
        payload,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Workspace updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to update workspace.');
    },
  });
};

export const useDeleteWorkspace = (organizationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceId) => {
      const activeOrgId = cleanId(organizationId) || cleanId(localStorage.getItem('nexora_org_id'));
      await apiClient.delete(`/organizations/${activeOrgId}/workspaces/${workspaceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Workspace deleted successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete workspace.');
    },
  });
};
