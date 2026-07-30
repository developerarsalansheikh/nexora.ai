import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useProjectDetails, useProjectActivity, useToggleFavoriteProject, useArchiveProject } from '../api/useProjects';
import EditProjectModal from '../components/EditProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';
import ProjectMembersPage from './ProjectMembersPage';
import ProjectSettingsPage from './ProjectSettingsPage';

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [activeTab, setActiveTab] = useState('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: project, isLoading, isError } = useProjectDetails(organizationId, workspaceId, projectId);
  const { data: activities, isLoading: isActivitiesLoading } = useProjectActivity(organizationId, workspaceId, projectId);

  const toggleFavorite = useToggleFavoriteProject(organizationId, workspaceId);
  const archiveMutation = useArchiveProject(organizationId, workspaceId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-text-tertiary">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-semibold">Loading project details...</span>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="p-8 border border-rose-500/25 bg-rose-500/5 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-12">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-base font-bold text-rose-500">Project Not Found</h3>
        <p className="text-xs text-text-secondary">
          The requested project does not exist or you do not have permission to view it.
        </p>
        <Link
          to="/projects"
          className="inline-block px-4 py-2 text-xs rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-border-primary text-text-primary font-medium transition-colors"
        >
          ← Back to Projects
        </Link>
      </div>
    );
  }

  const isFavorited = Array.isArray(project.favorites) && project.favorites.includes(user?._id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-text-tertiary">
        <Link to="/projects" className="hover:text-text-primary transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="font-mono font-bold text-text-secondary uppercase">{project.key}</span>
        <span>/</span>
        <span className="font-semibold text-text-primary truncate">{project.name}</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-500 border border-brand-500/20 uppercase">
              {project.key}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-bg-tertiary text-text-secondary border border-border-primary capitalize">
              {project.category || 'Engineering'}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
              {project.status || 'Active'}
            </span>
            <button
              onClick={() => toggleFavorite.mutate(project._id)}
              className={`text-base transition-transform active:scale-125 ${
                isFavorited ? 'text-amber-400' : 'text-text-tertiary hover:text-amber-400'
              }`}
            >
              {isFavorited ? '★' : '☆'}
            </button>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">{project.name}</h1>
          <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
            {project.description || 'No description provided for this project.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/projects/${project._id}/board`}
            className="px-3.5 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity flex items-center gap-1.5"
          >
            <span>📋</span> Task Board
          </Link>
          <Link
            to={`/projects/${project._id}/sprints`}
            className="px-3.5 py-2 text-xs rounded-xl border border-border-primary bg-bg-secondary hover:bg-bg-tertiary font-medium text-text-primary transition-colors flex items-center gap-1.5"
          >
            <span>🏃</span> Sprints
          </Link>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-2 text-xs rounded-xl border border-border-primary bg-bg-secondary hover:bg-bg-tertiary font-medium text-text-primary transition-colors"
          >
            ✏️ Edit Details
          </button>
          <button
            onClick={() => archiveMutation.mutate(project._id, { onSuccess: () => navigate('/projects') })}
            className="px-3.5 py-2 text-xs rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 font-medium text-amber-600 transition-colors"
          >
            📦 Archive
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-border-primary gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
          }`}
        >
          📋 Overview
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
          }`}
        >
          👥 Team Members ({project.members?.length || 1})
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-brand-500 text-brand-500'
              : 'border-transparent text-text-tertiary hover:text-text-primary'
          }`}
        >
          ⚙️ Settings
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Cards */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 space-y-4">
              <h3 className="text-xs uppercase font-bold text-text-tertiary tracking-wider">Project Metadata</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border-primary">
                  <span className="text-text-tertiary">Owner / Lead</span>
                  <span className="font-semibold text-text-primary">{project.ownerId?.name || 'Unassigned'}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border-primary">
                  <span className="text-text-tertiary">Visibility</span>
                  <span className="font-semibold text-text-primary capitalize">{project.visibility}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-border-primary">
                  <span className="text-text-tertiary">Start Date</span>
                  <span className="font-semibold text-text-primary">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>

                <div className="flex justify-between py-1.5">
                  <span className="text-text-tertiary">End Date</span>
                  <span className="font-semibold text-text-primary">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Stream */}
          <div className="lg:col-span-2 p-5 rounded-2xl border border-border-primary bg-bg-secondary/40 space-y-4">
            <h3 className="text-xs uppercase font-bold text-text-tertiary tracking-wider">Activity Audit Stream</h3>

            {isActivitiesLoading ? (
              <div className="text-xs text-text-tertiary py-4 text-center">Loading audit stream...</div>
            ) : !activities || activities.length === 0 ? (
              <div className="text-xs text-text-tertiary py-6 text-center">No activity recorded for this project yet.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {activities.map((act) => (
                  <div key={act._id} className="p-3 rounded-xl border border-border-primary bg-bg-primary/50 flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {act.userId?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="text-text-primary font-medium">
                        <span className="font-bold">{act.userId?.name || 'User'}</span> performed{' '}
                        <span className="font-mono text-brand-500 font-bold">{act.action}</span>
                      </p>
                      <span className="text-[10px] text-text-tertiary block">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <ProjectMembersPage project={project} organizationId={organizationId} workspaceId={workspaceId} />
      )}

      {activeTab === 'settings' && (
        <ProjectSettingsPage
          project={project}
          organizationId={organizationId}
          workspaceId={workspaceId}
          onOpenDelete={() => setIsDeleteModalOpen(true)}
        />
      )}

      {/* Edit & Delete Modals */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        organizationId={organizationId}
        workspaceId={workspaceId}
        project={project}
      />

      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        organizationId={organizationId}
        workspaceId={workspaceId}
        project={project}
        onDeleted={() => navigate('/projects')}
      />
    </div>
  );
}
