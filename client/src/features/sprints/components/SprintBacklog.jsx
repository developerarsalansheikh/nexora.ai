import React from 'react';
import { useMoveTasksToSprint } from '../api/useSprints';

export default function SprintBacklog({
  sprints = [],
  backlogTasks = [],
  organizationId,
  workspaceId,
  projectId,
  onTaskClick,
}) {
  const moveTasks = useMoveTasksToSprint(organizationId, workspaceId, projectId);

  const handleMoveToSprint = (taskId, targetSprintId) => {
    moveTasks.mutate({ sprintId: targetSprintId, taskIds: [taskId] });
  };

  return (
    <div className="space-y-6">
      {/* Planned / Active Sprints Sections */}
      {sprints.map((sprint) => {
        const isCompleted = sprint.status === 'completed';
        const isActive = sprint.status === 'active';

        return (
          <div
            key={sprint._id}
            className={`p-5 rounded-2xl border bg-bg-secondary/40 backdrop-blur-md space-y-4 ${
              isActive
                ? 'border-brand-500/40 ring-1 ring-brand-500/20'
                : 'border-border-primary'
            }`}
          >
            {/* Sprint Section Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-base">{isActive ? '⚡' : isCompleted ? '✅' : '🏃'}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-text-primary">{sprint.name}</h3>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isCompleted
                          ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {sprint.status}
                    </span>
                  </div>
                  {sprint.goal && (
                    <p className="text-xs text-text-tertiary mt-0.5">{sprint.goal}</p>
                  )}
                </div>
              </div>

              <div className="text-xs font-mono text-text-tertiary">
                {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'No start date'}
                {' — '}
                {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'No end date'}
              </div>
            </div>
          </div>
        );
      })}

      {/* Unassigned Backlog Section */}
      <div className="p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <h3 className="text-sm font-bold text-text-primary">Backlog (Unassigned Tasks)</h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary border border-border-primary">
              {backlogTasks.length}
            </span>
          </div>
        </div>

        {/* Backlog Task List */}
        <div className="space-y-2">
          {backlogTasks.map((task) => (
            <div
              key={task._id}
              onClick={() => onTaskClick?.(task)}
              className="flex items-center justify-between p-3 rounded-xl border border-border-primary bg-bg-primary hover:border-brand-500/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-text-tertiary">{task.key}</span>
                <span className="text-xs font-medium text-text-primary group-hover:text-brand-400 transition-colors">
                  {task.title}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {task.storyPoints > 0 && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary">
                    {task.storyPoints} pts
                  </span>
                )}

                {/* Move to Sprint dropdown */}
                {sprints.filter((s) => s.status !== 'completed').length > 0 && (
                  <select
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      if (e.target.value) handleMoveToSprint(task._id, e.target.value);
                    }}
                    defaultValue=""
                    className="px-2 py-1 text-[10px] rounded-lg border border-border-primary bg-bg-secondary text-text-secondary focus:outline-none focus:border-brand-500"
                  >
                    <option value="" disabled>
                      Move to sprint...
                    </option>
                    {sprints
                      .filter((s) => s.status !== 'completed')
                      .map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} ({s.status})
                        </option>
                      ))}
                  </select>
                )}
              </div>
            </div>
          ))}

          {backlogTasks.length === 0 && (
            <div className="p-8 text-center text-text-tertiary text-xs border border-dashed border-border-primary rounded-xl">
              Backlog is clear! All tasks are assigned to sprints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
