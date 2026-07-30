import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

export const useMyOrganizations = () => {
  return useQuery({
    queryKey: ['myOrganizations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/organizations');
      return data.organizations ?? [];
    },
  });
};

export const useMyInvitations = () => {
  return useQuery({
    queryKey: ['myInvitations'],
    queryFn: async () => {
      const { data } = await apiClient.get('/organizations/invitations');
      return data.invitations ?? [];
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orgId, payload }) => {
      const { data } = await apiClient.patch(`/organizations/${orgId}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrganizations'] });
      toast.success('Organization updated successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update organization.');
    },
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orgId) => {
      const { data } = await apiClient.post(`/organizations/${orgId}/members/accept`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      queryClient.invalidateQueries({ queryKey: ['myOrganizations'] });
      toast.success('Invitation accepted!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to accept invitation.');
    },
  });
};

export const useRejectInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orgId) => {
      const { data } = await apiClient.post(`/organizations/${orgId}/members/reject`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInvitations'] });
      toast.success('Invitation rejected.');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to reject invitation.');
    },
  });
};
