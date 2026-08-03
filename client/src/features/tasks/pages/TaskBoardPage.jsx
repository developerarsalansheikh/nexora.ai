import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTasks, useCreateTask, useReorderTasks } from '../api/useTasks';
import KanbanBoard from '../components/KanbanBoard';
import TaskFilterToolbar from '../components/TaskFilterToolbar';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskDetailsDrawer from '../components/TaskDetailsDrawer';
import TaskEmptyState from '../components/TaskEmptyState';
import { KanbanSkeleton } from '../components/TaskSkeletons';

export default function TaskBoardPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  // ─── Filter & View State ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [priority, setPriority] = useState('');
  const [swimlane, setSwimlane] = useState('status');

  // ─── Modal & Drawer State ─────────────────────────────────────────────────
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [defaultCreateStatus, setDefaultCreateStatus] = useState('backlog');
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ─── API Queries & Mutations ──────────────────────────────────────────────
  const { data, isLoading, isError } = useTasks(organizationId, workspaceId, projectId, {
    search,
    type,
    priority,
    limit: 200, // Fetch all tasks for Kanban (no server-side pagination for board view)
  });

  const createTask = useCreateTask(organizationId, workspaceId, projectId);
  const reorderTasks = useReorderTasks(organizationId, workspaceId, projectId);

  const tasks = data?.docs || [];

  // ─── Event Handlers ───────────────────────────────────────────────────────
  const handleCardClick = useCallback((task) => {
    setSelectedTaskId(task._id);
  }, []);

  const handleAddTask = useCallback((status) => {
    setDefaultCreateStatus(status || 'backlog');
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateTask = useCallback(
    (payload) => {
      createTask.mutate(payload, {
        onSuccess: () => setIsCreateModalOpen(false),
      });
    },
    [createTask],
  );

  const handleReorder = useCallback(
    (items) => {
      reorderTasks.mutate(items);
    },
    [reorderTasks],
  );

  const handleResetFilters = useCallback(() => {
    setSearch('');
    setType('');
    setPriority('');
  }, []);

  const handleFilterMyTasks = useCallback(() => {
    // This is a UI-only filter — filter tasks by current user in the query params
    // The API filter is handled server-side via `assignee` param
    // For simplicity, we can set a search filter or use a dedicated state
  }, []);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary font-sans flex items-center gap-2">
            <span className="text-lg">🗂️</span> Task Board
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Drag tasks across columns to update their status. Click a card to view details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-xs rounded-xl bg-bg-secondary hover:bg-bg-tertiary font-medium transition-colors border border-border-primary text-text-secondary hover:text-text-primary"
          >
            ← Back
          </button>
          <button
            onClick={() => handleAddTask('backlog')}
            className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity"
          >
            + Create Task
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TaskFilterToolbar
        search={search}
        setSearch={setSearch}
        type={type}
        setType={setType}
        priority={priority}
        setPriority={setPriority}
        swimlane={swimlane}
        setSwimlane={setSwimlane}
        onResetFilters={handleResetFilters}
        currentUserId={user?._id}
        onFilterMyTasks={handleFilterMyTasks}
      />

      {/* Board Content */}
      {isLoading ? (
        <KanbanSkeleton />
      ) : isError ? (
        <div className="p-8 text-center text-rose-400 text-sm">
          Failed to load tasks. Please try again.
        </div>
      ) : tasks.length === 0 && !search && !type && !priority ? (
        <TaskEmptyState
          title="No tasks yet"
          description="Create your first task to get started with Kanban board management."
          actionText="+ Create First Task"
          onAction={() => handleAddTask('backlog')}
        />
      ) : (
        <KanbanBoard
          tasks={tasks}
          onReorder={handleReorder}
          onCardClick={handleCardClick}
          onAddTask={handleAddTask}
          swimlane={swimlane}
        />
      )}

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        isLoading={createTask.isPending}
        defaultStatus={defaultCreateStatus}
        organizationId={organizationId}
      />

      {/* Task Details Drawer */}
      <TaskDetailsDrawer
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        taskId={selectedTaskId}
        organizationId={organizationId}
        workspaceId={workspaceId}
        projectId={projectId}
      />
    </div>
  );
}
