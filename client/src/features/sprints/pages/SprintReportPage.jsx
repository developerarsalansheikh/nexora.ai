import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useActiveSprint, useSprintBurndown, useVelocityChart } from '../api/useSprints';
import BurndownChart from '../components/BurndownChart';
import VelocityChart from '../components/VelocityChart';

export default function SprintReportPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const { data: activeSprint } = useActiveSprint(organizationId, workspaceId, projectId);
  const { data: burndown } = useSprintBurndown(
    organizationId,
    workspaceId,
    projectId,
    activeSprint?._id,
  );
  const { data: velocity } = useVelocityChart(organizationId, workspaceId, projectId);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <span>📊</span> Sprint Analytics & Retrospective Reports
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Real-time burndown trajectory, velocity insights, and performance tracking.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-xs rounded-xl bg-bg-secondary hover:bg-bg-tertiary font-medium transition-colors border border-border-primary text-text-secondary hover:text-text-primary"
        >
          ← Back to Sprints
        </button>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BurndownChart burndownData={burndown} />
        <VelocityChart velocityData={velocity} />
      </div>
    </div>
  );
}
