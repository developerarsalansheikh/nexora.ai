import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useProjects } from '../../projects/api/useProjects';
import CreateProjectModal from '../../projects/components/CreateProjectModal';
import { FiTrello, FiPlus } from 'react-icons/fi';

/**
 * TaskBoardRedirect — Smart router component for the /board route.
 * Automatically forwards to the first active project's Kanban board,
 * or displays a project creation prompt if no active projects exist.
 */
export default function TaskBoardRedirect() {
  const navigate = useNavigate();
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading } = useProjects(organizationId, workspaceId, { limit: 10, isArchived: false });
  const projects = data?.docs || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-text-tertiary">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-semibold">Opening Task Board...</span>
      </div>
    );
  }

  // If projects exist, automatically redirect to the first project's board
  if (projects.length > 0) {
    return <Navigate to={`/projects/${projects[0]._id}/board`} replace />;
  }

  // If no projects exist, present a clean state to create a project first
  return (
    <div className="max-w-2xl mx-auto my-16 p-8 rounded-3xl border border-border-primary bg-bg-secondary/40 backdrop-blur-xl text-center space-y-6 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center text-3xl mx-auto shadow-inner">
        <FiTrello />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-text-primary">No Projects Found</h2>
        <p className="text-xs text-text-secondary leading-relaxed max-w-md mx-auto">
          To view and manage tasks on a Kanban board, create a project first.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 text-xs rounded-xl border border-border-primary bg-bg-secondary hover:bg-bg-tertiary font-medium text-text-secondary transition-colors"
        >
          View Projects List
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/20 transition-opacity flex items-center gap-2"
        >
          <FiPlus /> Create First Project
        </button>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId={organizationId}
        workspaceId={workspaceId}
      />
    </div>
  );
}
