import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

const billingPath = (orgId) => `/organizations/${orgId}/billing`;

export const useSubscription = (orgId) => {
  return useQuery({
    queryKey: ['subscription', orgId],
    queryFn: async () => {
      const res = await apiClient.get(`${billingPath(orgId)}/subscription`);
      return res.data ?? {};
    },
    enabled: !!orgId,
  });
};

export const useUpgradePlan = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ plan, billingCycle }) => {
      const res = await apiClient.post(`${billingPath(orgId)}/upgrade`, { plan, billingCycle });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription', orgId] });
      queryClient.invalidateQueries({ queryKey: ['invoices', orgId] });
      toast.success(data?.message || 'Subscription updated successfully!');
    },
    onError: (err) => {
      toast.error(err?.message || 'Failed to update subscription.');
    },
  });
};

export const useInvoices = (orgId, options = {}) => {
  return useQuery({
    queryKey: ['invoices', orgId, options.page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.page) params.append('page', options.page);
      const res = await apiClient.get(`${billingPath(orgId)}/invoices?${params}`);
      return res.data ?? { docs: [] };
    },
    enabled: !!orgId,
  });
};
