import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAiLogs, useTokenUsage } from '../api/useAi';
import { FiCpu, FiActivity, FiUser, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

/**
 * AiAuditDashboard — Workspace AI audit logging & token usage analytics view.
 */
export default function AiAuditDashboard() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [page, setPage] = useState(1);
  const { data: logsData, isLoading: isLogsLoading, refetch } = useAiLogs(organizationId, workspaceId, { page, limit: 20 });
  const { data: usageData, isLoading: isUsageLoading } = useTokenUsage(organizationId, workspaceId);

  const logs = logsData?.docs || [];
  const meta = logsData?.meta || {};

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">Total Requests</span>
            <FiActivity size={16} className="text-brand-500" />
          </div>
          <p className="text-2xl font-black text-text-primary">{usageData?.totalRequests || 0}</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">Total Tokens Used</span>
            <FiCpu size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-text-primary">{(usageData?.totalTokens || 0).toLocaleString()}</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">Prompt Tokens</span>
            <span className="text-xs text-brand-500 font-bold">IN</span>
          </div>
          <p className="text-2xl font-black text-text-primary">{(usageData?.totalPromptTokens || 0).toLocaleString()}</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">Completion Tokens</span>
            <span className="text-xs text-green-500 font-bold">OUT</span>
          </div>
          <p className="text-2xl font-black text-text-primary">{(usageData?.totalCompletionTokens || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <div>
            <h3 className="text-sm font-bold text-text-primary">AI Operation Audit Logs</h3>
            <p className="text-xs text-text-tertiary">Complete audit trail of all AI assistant actions</p>
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            <FiRefreshCw size={15} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-tertiary/50 text-text-tertiary border-b border-border-primary">
              <tr>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Model</th>
                <th className="px-6 py-3 font-semibold">Tokens</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary/50 text-text-primary">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-text-tertiary">
                    No AI activity recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-bg-tertiary/30 transition-colors">
                    <td className="px-6 py-3 font-mono font-medium text-brand-500">{log.action}</td>
                    <td className="px-6 py-3">{log.userId?.name || 'System'}</td>
                    <td className="px-6 py-3 text-text-tertiary font-mono text-[11px]">{log.modelUsed}</td>
                    <td className="px-6 py-3 font-mono">{log.totalTokens?.toLocaleString()}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-text-tertiary">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
