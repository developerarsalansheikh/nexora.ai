import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useAnalytics } from '../api/useAnalytics';
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiZap,
  FiPieChart,
  FiBarChart2,
  FiFilter,
} from 'react-icons/fi';

/**
 * AnalyticsDashboardPage — Interactive SaaS analytics suite with metric cards and visualizations.
 */
export default function AnalyticsDashboardPage() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [range, setRange] = useState('30d');

  const { data: analytics, isLoading } = useAnalytics(organizationId, workspaceId, { range });

  const summary = analytics?.summary || {};
  const velocityData = analytics?.velocityData || [];
  const memberWorkload = analytics?.memberWorkload || [];
  const projectHealth = analytics?.projectHealth || [];
  const burndown = analytics?.burndown || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Workspace Analytics</h2>
          <p className="text-xs text-text-tertiary">Real-time performance metrics, velocity, and team capacity</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-1.5 bg-bg-secondary border border-border-primary rounded-xl p-1 text-xs">
          <FiFilter size={13} className="text-text-tertiary ml-2" />
          {[
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                range === r.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">Tasks Completed</span>
            <FiCheckCircle size={16} className="text-green-500" />
          </div>
          <p className="text-3xl font-black text-text-primary">{summary.tasksCompleted || 0}</p>
          <p className="text-[10px] text-text-tertiary">{summary.completionRate || 0}% Completion Rate</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">Avg. Cycle Time</span>
            <FiClock size={16} className="text-blue-500" />
          </div>
          <p className="text-3xl font-black text-text-primary">{summary.avgCycleTimeDays || 0} <span className="text-sm font-semibold">Days</span></p>
          <p className="text-[10px] text-text-tertiary">Created → Done Duration</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">AI Tokens Used</span>
            <FiZap size={16} className="text-purple-500" />
          </div>
          <p className="text-3xl font-black text-text-primary">{(summary.totalAiTokens || 0).toLocaleString()}</p>
          <p className="text-[10px] text-text-tertiary">{summary.totalAiRequests || 0} AI Operations</p>
        </div>

        <div className="p-5 rounded-2xl bg-bg-secondary border border-border-primary space-y-2">
          <div className="flex items-center justify-between text-text-tertiary">
            <span className="text-xs font-semibold">Total System Events</span>
            <FiActivity size={16} className="text-brand-500" />
          </div>
          <p className="text-3xl font-black text-text-primary">{summary.totalActivities || 0}</p>
          <p className="text-[10px] text-text-tertiary">Activity Audit Logs</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sprint Velocity History */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-primary space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiTrendingUp className="text-brand-500" size={16} />
              <h3 className="text-sm font-bold text-text-primary">Sprint Velocity</h3>
            </div>
            <span className="text-[10px] text-text-tertiary">Completed Story Points</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-border-primary">
            {velocityData.length === 0 ? (
              <p className="text-xs text-text-tertiary m-auto">No completed sprints yet.</p>
            ) : (
              velocityData.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-bold text-brand-500 group-hover:scale-110 transition-transform">
                    {v.completedPoints}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-brand-600 to-indigo-500 rounded-t-lg transition-all duration-300 min-h-[12px]"
                    style={{ height: `${Math.min(100, Math.max(12, v.completedPoints * 4))}px` }}
                  />
                  <span className="text-[9px] text-text-tertiary truncate max-w-[60px]">{v.sprintName}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sprint Burndown Bar */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-primary space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="text-purple-500" size={16} />
              <h3 className="text-sm font-bold text-text-primary">Active Sprint Burndown</h3>
            </div>
            <span className="text-[10px] text-text-tertiary">Ideal vs Remaining Points</span>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-border-primary">
            {burndown.length === 0 ? (
              <p className="text-xs text-text-tertiary m-auto">No active sprint running.</p>
            ) : (
              burndown.map((b, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-1 h-32 justify-center">
                    <div
                      className="w-1/2 bg-gray-500/20 rounded-t"
                      style={{ height: `${Math.min(100, Math.max(10, b.ideal * 4))}px` }}
                      title={`Ideal: ${b.ideal}`}
                    />
                    <div
                      className="w-1/2 bg-purple-500 rounded-t"
                      style={{ height: `${Math.min(100, Math.max(10, b.actual * 4))}px` }}
                      title={`Actual: ${b.actual}`}
                    />
                  </div>
                  <span className="text-[9px] text-text-tertiary mt-2">{b.day}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Team Workload & Project Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Capacity Distribution */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-primary space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Team Workload Distribution</h3>
            <span className="text-[10px] text-text-tertiary">Open Tasks per Member</span>
          </div>

          <div className="space-y-3">
            {memberWorkload.length === 0 ? (
              <p className="text-xs text-text-tertiary">No members found.</p>
            ) : (
              memberWorkload.map((m, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-text-primary">
                    <span>{m.memberName}</span>
                    <span className="text-text-tertiary">{m.taskCount} tasks ({m.storyPoints} pts)</span>
                  </div>
                  <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(5, m.taskCount * 10))}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Project Health Progress */}
        <div className="p-6 rounded-2xl bg-bg-secondary border border-border-primary space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary">Project Progress Health</h3>
            <span className="text-[10px] text-text-tertiary">Completion Status</span>
          </div>

          <div className="space-y-3">
            {projectHealth.length === 0 ? (
              <p className="text-xs text-text-tertiary">No active projects.</p>
            ) : (
              projectHealth.map((p, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-text-primary">
                    <span>{p.name}</span>
                    <span className="text-brand-500 font-bold">{p.progress || 0}%</span>
                  </div>
                  <div className="w-full h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-green-500 rounded-full transition-all"
                      style={{ width: `${p.progress || 0}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
