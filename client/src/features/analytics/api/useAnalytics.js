import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../config/axios';

const analyticsPath = (orgId, wsId) => `/organizations/${orgId}/workspaces/${wsId}/analytics`;

export const useAnalytics = (orgId, wsId, options = {}) => {
  return useQuery({
    queryKey: ['analytics', orgId, wsId, options.range, options.projectId, options.startDate, options.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.range) params.append('range', options.range);
      if (options.projectId) params.append('projectId', options.projectId);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const res = await apiClient.get(`${analyticsPath(orgId, wsId)}?${params}`);
      const payload = res?.data ?? res;
      return payload?.analytics ?? payload ?? {};
    },
    enabled: !!orgId && !!wsId,
  });
};
