import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useReport, exportReportCsv } from '../api/useReports';
import {
  FiFileText,
  FiDownload,
  FiPieChart,
  FiTrendingUp,
  FiClock,
  FiUsers,
  FiZap,
  FiActivity,
  FiCheckCircle,
} from 'react-icons/fi';

/**
 * ReportsDashboardPage — Enterprise reporting suite with live previews and exports.
 */
export default function ReportsDashboardPage() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [selectedReport, setSelectedReport] = useState('project_progress');

  const { data: reportData, isLoading } = useReport(organizationId, workspaceId, selectedReport);

  const reportTypes = [
    { id: 'project_progress', name: 'Project Progress', desc: 'Completion rates and task status per project', icon: FiPieChart },
    { id: 'sprint_report', name: 'Sprint Performance', desc: 'Story points breakdown and sprint tasks', icon: FiTrendingUp },
    { id: 'team_productivity', name: 'Team Productivity', desc: 'Tasks completed and logged hours per member', icon: FiUsers },
    { id: 'task_completion', name: 'Task Completion', desc: 'Detailed task audit and creation timestamps', icon: FiCheckCircle },
    { id: 'time_tracking', name: 'Time Tracking', desc: 'Estimated vs actual logged hours and variance', icon: FiClock },
    { id: 'workload', name: 'Team Workload', desc: 'Open task distribution and remaining hours', icon: FiUsers },
    { id: 'ai_usage', name: 'AI Usage Audit', desc: 'Token usage breakdown and model actions', icon: FiZap },
    { id: 'activity', name: 'Workspace Activity', desc: 'Complete audit log of system events', icon: FiActivity },
  ];

  const handleExportCsv = () => {
    exportReportCsv(organizationId, workspaceId, selectedReport);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Reports Generator</h2>
          <p className="text-xs text-text-tertiary">Generate, preview, and export enterprise operational reports</p>
        </div>
        <button
          onClick={handleExportCsv}
          disabled={!reportData || isLoading}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center gap-2 shadow-md shadow-brand-500/20"
        >
          <FiDownload size={14} />
          Export CSV / Excel
        </button>
      </div>

      {/* Grid of Report Cards Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {reportTypes.map((r) => {
          const Icon = r.icon;
          const isSelected = selectedReport === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedReport(r.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 group ${
                isSelected
                  ? 'border-brand-500/50 bg-brand-500/10 shadow-lg shadow-brand-500/5'
                  : 'border-border-primary bg-bg-secondary hover:border-brand-500/20 hover:bg-bg-tertiary/50'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${
                isSelected ? 'bg-brand-500 text-white' : 'bg-bg-tertiary text-text-secondary group-hover:text-brand-500'
              }`}>
                <Icon size={16} />
              </div>
              <h3 className={`text-xs font-bold ${isSelected ? 'text-brand-600 dark:text-brand-400' : 'text-text-primary'}`}>
                {r.name}
              </h3>
              <p className="text-[10px] text-text-tertiary mt-1 line-clamp-2">{r.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Report Data Preview Table */}
      <div className="rounded-2xl bg-bg-secondary border border-border-primary overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary">
          <div>
            <h3 className="text-sm font-bold text-text-primary">{reportData?.title || 'Report Preview'}</h3>
            <p className="text-xs text-text-tertiary">Real-time data aggregated from active workspace records</p>
          </div>
          <span className="text-[10px] uppercase font-mono font-bold bg-brand-500/10 text-brand-500 px-2.5 py-1 rounded-full">
            {reportData?.rows?.length || 0} Records
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-xs text-text-tertiary">Generating report data...</div>
        ) : !reportData || reportData.rows?.length === 0 ? (
          <div className="py-16 text-center text-xs text-text-tertiary">No data available for this report type.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-tertiary/50 text-text-tertiary border-b border-border-primary">
                <tr>
                  {reportData.columns?.map((col) => (
                    <th key={col.key} className="px-6 py-3.5 font-semibold">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/50 text-text-primary font-sans">
                {reportData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-bg-tertiary/30 transition-colors">
                    {reportData.columns.map((col) => (
                      <td key={col.key} className="px-6 py-3.5 whitespace-nowrap">
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
