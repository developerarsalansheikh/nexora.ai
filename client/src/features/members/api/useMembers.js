import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

export const useMembers = (organizationId) => {
  return useQuery({
    queryKey: ['members', organizationId],
    queryFn: async () => {
      const res = await apiClient.get(`/organizations/${organizationId}/members`);
      const payload = res?.data ?? res;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.docs)) return payload.docs;
      return payload?.docs ?? [];
    },
    enabled: !!organizationId,
  });
};

export const useInviteMember = (organizationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post(`/organizations/${organizationId}/members/invite`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      toast.success('Member invited successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to invite member.');
    },
  });
};

export const useUpdateMemberRole = (organizationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ memberId, role }) => {
      const { data } = await apiClient.patch(`/organizations/${organizationId}/members/${memberId}`, { role });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      toast.success('Member role updated!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update member role.');
    },
  });
};

export const useRemoveMember = (organizationId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId) => {
      await apiClient.delete(`/organizations/${organizationId}/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', organizationId] });
      toast.success('Member removed successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove member.');
    },
  });
};
