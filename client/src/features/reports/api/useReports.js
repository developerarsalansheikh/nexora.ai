import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../config/axios';
import { toast } from 'react-hot-toast';

const reportsPath = (orgId, wsId) => `/organizations/${orgId}/workspaces/${wsId}/reports`;

export const useReport = (orgId, wsId, reportType, options = {}) => {
  return useQuery({
    queryKey: ['report', orgId, wsId, reportType, options.projectId, options.sprintId, options.startDate, options.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.projectId) params.append('projectId', options.projectId);
      if (options.sprintId) params.append('sprintId', options.sprintId);
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);

      const res = await apiClient.get(`${reportsPath(orgId, wsId)}/${reportType}?${params}`);
      return res.data?.report ?? {};
    },
    enabled: !!orgId && !!wsId && !!reportType,
  });
};

export const exportReportCsv = async (orgId, wsId, reportType, options = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('format', 'csv');
    if (options.projectId) params.append('projectId', options.projectId);
    if (options.sprintId) params.append('sprintId', options.sprintId);
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);

    const getApiBaseUrl = () => {
      if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
      }
      if (
        typeof window !== 'undefined' &&
        !window.location.hostname.includes('localhost') &&
        !window.location.hostname.includes('127.0.0.1')
      ) {
        return 'https://nexora-ai-93tu.onrender.com/api/v1';
      }
      return 'http://localhost:5000/api/v1';
    };

    const token = localStorage.getItem('nexora_jwt_token');
    const response = await fetch(
      `${getApiBaseUrl()}${reportsPath(orgId, wsId)}/${reportType}?${params}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('Report CSV exported successfully!');
  } catch (err) {
    toast.error('Failed to export CSV report.');
  }
};
