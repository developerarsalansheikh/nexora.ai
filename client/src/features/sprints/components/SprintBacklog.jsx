import React from 'react';
import { useMoveTasksToSprint } from '../api/useSprints';
import { FiTrash2, FiPlay, FiCheckCircle, FiPlus, FiEdit2 } from 'react-icons/fi';

export default function SprintBacklog({
  sprints = [],
  allTasks = [],
  backlogTasks = [],
  organizationId,
  workspaceId,
  projectId,
  onTaskClick,
  onAddTask,
  onStartSprint,
  onCompleteSprint,
  onDeleteSprint,
}) {
  const moveTasks = useMoveTasksToSprint(organizationId, workspaceId, projectId);

  const handleMoveToSprint = (taskId, targetSprintId) => {
    moveTasks.mutate({ sprintId: targetSprintId, taskIds: [taskId] });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Planned & Active & Completed Sprints List */}
      {sprints.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span>🏃</span> Project Sprints
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
                {sprints.length}
              </span>
            </h3>
          </div>

          {sprints.map((sprint) => {
            const isCompleted = sprint.status === 'completed';
            const isActive = sprint.status === 'active';
            const isPlanned = sprint.status === 'planned';

            // Filter tasks for this sprint
            const sprintTasks = allTasks.filter((t) => {
              if (!t.sprintId) return false;
              const sId = typeof t.sprintId === 'object' ? t.sprintId._id : t.sprintId;
              return sId === sprint._id;
            });

            const totalPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);

            return (
              <div
                key={sprint._id}
                className={`p-5 rounded-2xl border transition-all space-y-4 ${
                  isActive
                    ? 'border-brand-500/40 bg-gradient-to-r from-brand-500/5 via-bg-secondary/40 to-transparent ring-1 ring-brand-500/20'
                    : isCompleted
                    ? 'border-border-primary bg-bg-secondary/20 opacity-80'
                    : 'border-border-primary bg-bg-secondary/40 backdrop-blur-md hover:border-brand-500/30'
                }`}
              >
                {/* Sprint Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-primary/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{isActive ? '⚡' : isCompleted ? '✅' : '🏃'}</span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-text-primary">{sprint.name}</h4>
                        <span
                          className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isCompleted
                              ? 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {sprint.status}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-bg-tertiary text-text-secondary border border-border-primary">
                          {sprintTasks.length} Tasks ({totalPoints} pts)
                        </span>
                      </div>
                      {sprint.goal && (
                        <p className="text-xs text-text-tertiary mt-0.5">{sprint.goal}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Dates */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-xs font-mono text-text-tertiary hidden md:block">
                      {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'No start date'}
                      {' — '}
                      {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'No end date'}
                    </div>

                    <div className="flex items-center gap-2">
                      {onAddTask && (
                        <button
                          onClick={() => onAddTask(sprint._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-xs font-medium border border-border-primary transition-colors cursor-pointer"
                          title="Add task directly to this sprint"
                        >
                          <FiPlus size={12} />
                          <span>Add Task</span>
                        </button>
                      )}

                      {isPlanned && onStartSprint && (
                        <button
                          onClick={() => onStartSprint(sprint._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <FiPlay size={12} />
                          <span>Start Sprint</span>
                        </button>
                      )}

                      {isActive && onCompleteSprint && (
                        <button
                          onClick={() => onCompleteSprint(sprint._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <FiCheckCircle size={12} />
                          <span>Complete Sprint</span>
                        </button>
                      )}

                      {onDeleteSprint && (
                        <button
                          onClick={() => onDeleteSprint(sprint._id)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-text-tertiary hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Sprint"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tasks inside this sprint */}
                <div className="space-y-2">
                  {sprintTasks.map((task) => {
                    const assigneeObj = typeof task.assignee === 'object' ? task.assignee : null;
                    const assigneeName = assigneeObj?.name || 'Unassigned';

                    return (
                      <div
                        key={task._id}
                        onClick={() => onTaskClick?.(task)}
                        className="flex items-center justify-between p-3 rounded-xl border border-border-primary bg-bg-primary/80 hover:border-brand-500/40 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-text-tertiary">{task.key || 'TASK'}</span>
                          <span className="text-xs font-semibold text-text-primary group-hover:text-brand-400 transition-colors">
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Assignee Avatar */}
                          <div
                            className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-[10px] flex items-center justify-center border border-brand-500/30 shrink-0"
                            title={`Assignee: ${assigneeName}`}
                          >
                            {getInitials(assigneeName)}
                          </div>

                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              task.status === 'completed' || task.status === 'done'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : task.status === 'in_progress'
                                ? 'bg-brand-500/10 text-brand-400'
                                : 'bg-bg-tertiary text-text-tertiary'
                            }`}
                          >
                            {task.status?.replace('_', ' ')}
                          </span>

                          {task.storyPoints > 0 && (
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary border border-border-primary">
                              {task.storyPoints} pts
                            </span>
                          )}

                          {/* Reassign / Move Dropdown */}
                          <select
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleMoveToSprint(task._id, e.target.value || null)}
                            defaultValue={sprint._id}
                            className="px-2 py-1 text-[10px] font-medium rounded-lg border border-border-primary bg-bg-secondary text-text-secondary focus:outline-none focus:border-brand-500 cursor-pointer"
                          >
                            <option value={sprint._id}>In: {sprint.name}</option>
                            <option value="">Move to Backlog</option>
                            {sprints
                              .filter((s) => s._id !== sprint._id && s.status !== 'completed')
                              .map((s) => (
                                <option key={s._id} value={s._id}>
                                  Move to: {s.name}
                                </option>
                              ))}
                          </select>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskClick?.(task);
                            }}
                            className="p-1 rounded text-text-tertiary hover:text-brand-400 transition-colors"
                            title="Edit & Assign Details"
                          >
                            <FiEdit2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {sprintTasks.length === 0 && (
                    <div className="p-4 text-center text-text-tertiary text-xs border border-dashed border-border-primary/60 rounded-xl bg-bg-primary/30">
                      No tasks in this sprint yet. Assign tasks from the backlog below or click "+ Add Task".
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-border-primary rounded-2xl bg-bg-secondary/20 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center text-2xl mx-auto">
            🏃
          </div>
          <h4 className="text-sm font-bold text-text-primary">No Sprints Created Yet</h4>
          <p className="text-xs text-text-tertiary max-w-sm mx-auto">
            Click "+ Create Sprint" above to plan your first iteration for this project.
          </p>
        </div>
      )}

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

          {onAddTask && (
            <button
              onClick={() => onAddTask(null)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-bg-secondary hover:bg-bg-tertiary text-text-secondary text-xs font-medium border border-border-primary transition-colors cursor-pointer"
            >
              <FiPlus size={12} />
              <span>Add Backlog Task</span>
            </button>
          )}
        </div>

        {/* Backlog Task List */}
        <div className="space-y-2">
          {backlogTasks.map((task) => {
            const assigneeObj = typeof task.assignee === 'object' ? task.assignee : null;
            const assigneeName = assigneeObj?.name || 'Unassigned';

            return (
              <div
                key={task._id}
                onClick={() => onTaskClick?.(task)}
                className="flex items-center justify-between p-3 rounded-xl border border-border-primary bg-bg-primary hover:border-brand-500/40 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-text-tertiary">{task.key || 'TASK'}</span>
                  <span className="text-xs font-semibold text-text-primary group-hover:text-brand-400 transition-colors">
                    {task.title}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Assignee Avatar */}
                  <div
                    className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-[10px] flex items-center justify-center border border-brand-500/30 shrink-0"
                    title={`Assignee: ${assigneeName}`}
                  >
                    {getInitials(assigneeName)}
                  </div>

                  {task.storyPoints > 0 && (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-bg-tertiary text-text-secondary border border-border-primary">
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
                      className="px-2.5 py-1 text-[10px] font-semibold rounded-lg border border-brand-500/30 bg-brand-500/10 text-brand-400 focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="" disabled>
                        Assign to Sprint...
                      </option>
                      {sprints
                        .filter((s) => s.status !== 'completed')
                        .map((s) => (
                          <option key={s._id} value={s._id} className="bg-bg-secondary text-text-primary">
                            {s.name} ({s.status})
                          </option>
                        ))}
                    </select>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick?.(task);
                    }}
                    className="p-1 rounded text-text-tertiary hover:text-brand-400 transition-colors"
                    title="Edit & Assign Details"
                  >
                    <FiEdit2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}

          {backlogTasks.length === 0 && (
            <div className="p-6 text-center text-text-tertiary text-xs border border-dashed border-border-primary rounded-xl">
              Backlog is clear! All tasks are assigned to sprints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
