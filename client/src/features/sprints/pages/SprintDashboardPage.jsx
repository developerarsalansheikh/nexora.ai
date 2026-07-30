import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  useSprints,
  useActiveSprint,
  useCreateSprint,
  useStartSprint,
  useCompleteSprint,
} from '../api/useSprints';
import { useTasks } from '../../tasks/api/useTasks';
import SprintBacklog from '../components/SprintBacklog';
import SprintPlanningModal from '../components/SprintPlanningModal';
import ConnectionStatus from '../../realtime/components/ConnectionStatus';
import OnlineAvatars from '../../realtime/components/OnlineAvatars';

export default function SprintDashboardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId = membership?.workspaceId || localStorage.getItem('nexora_workspace_id') || user?.currentWorkspaceId;

  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);

  // Queries
  const { data: sprintData, isLoading: isSprintsLoading } = useSprints(organizationId, workspaceId, projectId);
  const { data: activeSprint } = useActiveSprint(organizationId, workspaceId, projectId);
  const { data: taskData } = useTasks(organizationId, workspaceId, projectId, { limit: 200 });

  // Mutations
  const createSprint = useCreateSprint(organizationId, workspaceId, projectId);
  const startSprint = useStartSprint(organizationId, workspaceId, projectId);
  const completeSprint = useCompleteSprint(organizationId, workspaceId, projectId);

  const sprints = sprintData?.docs || [];
  const tasks = taskData?.docs || [];
  const backlogTasks = tasks.filter((t) => !t.sprintId);

  const handleCreateSprint = (payload) => {
    createSprint.mutate(payload, {
      onSuccess: () => setIsPlanningModalOpen(false),
    });
  };

  const handleStartSprint = (sprintId) => {
    if (window.confirm('Are you sure you want to start this sprint?')) {
      startSprint.mutate(sprintId);
    }
  };

  const handleCompleteSprint = (sprintId) => {
    if (window.confirm('Are you sure you want to complete this active sprint? Unfinished tasks will be moved to backlog.')) {
      completeSprint.mutate({ sprintId, moveToSprintId: null });
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <span>🏃</span> Sprint Management Hub
            </h2>
            <ConnectionStatus />
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Plan iterations, manage capacity, track velocity, and execute active sprints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OnlineAvatars />

          <button
            onClick={() => navigate(`/projects/${projectId}/sprints/reports`)}
            className="px-4 py-2 text-xs rounded-xl bg-bg-secondary hover:bg-bg-tertiary font-medium transition-colors border border-border-primary text-text-secondary hover:text-text-primary"
          >
            📊 Analytics & Reports
          </button>

          <button
            onClick={() => setIsPlanningModalOpen(true)}
            className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-semibold text-white shadow-md shadow-brand-500/10 transition-opacity"
          >
            + Create Sprint
          </button>
        </div>
      </div>

      {/* Active Sprint Highlights Card */}
      {activeSprint ? (
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 via-bg-secondary/40 to-transparent backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg font-bold">
                ⚡
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-primary">{activeSprint.name}</h3>
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Active Sprint
                  </span>
                </div>
                {activeSprint.goal && (
                  <p className="text-xs text-text-secondary mt-0.5">{activeSprint.goal}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/projects/${projectId}/board`)}
                className="px-4 py-2 text-xs rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 font-semibold hover:bg-brand-500/20 transition-colors"
              >
                Go to Active Board ➔
              </button>
              <button
                onClick={() => handleCompleteSprint(activeSprint._id)}
                disabled={completeSprint.isPending}
                className="px-4 py-2 text-xs rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
              >
                Complete Sprint
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl border border-dashed border-border-primary bg-bg-secondary/20 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto text-lg">
            ⚪
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">No Active Sprint</h3>
            <p className="text-xs text-text-tertiary mt-1">
              Select a planned sprint below and click "Start Sprint" to begin your iteration.
            </p>
          </div>
        </div>
      )}

      {/* Sprint Backlog & Planned Sprints */}
      <SprintBacklog
        sprints={sprints}
        backlogTasks={backlogTasks}
        organizationId={organizationId}
        workspaceId={workspaceId}
        projectId={projectId}
      />

      {/* Create Sprint Modal */}
      <SprintPlanningModal
        isOpen={isPlanningModalOpen}
        onClose={() => setIsPlanningModalOpen(false)}
        onSubmit={handleCreateSprint}
        isLoading={createSprint.isPending}
      />
    </div>
  );
}
