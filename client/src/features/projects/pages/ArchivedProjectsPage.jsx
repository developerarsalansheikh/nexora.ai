import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useProjects, useRestoreProject } from '../api/useProjects';
import { ProjectTableSkeleton } from '../components/ProjectSkeletons';
import ProjectEmptyState from '../components/ProjectEmptyState';
import DeleteProjectModal from '../components/DeleteProjectModal';

export default function ArchivedProjectsPage() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  const [deletingProject, setDeletingProject] = useState(null);

  const { data, isLoading, isError } = useProjects(organizationId, workspaceId, {
    isArchived: true,
  });

  const restoreMutation = useRestoreProject(organizationId, workspaceId);

  const projects = data?.docs || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary mb-1">
            <Link to="/projects" className="hover:text-text-primary transition-colors">
              Projects
            </Link>
            <span>/</span>
            <span className="font-semibold text-text-primary">Archived</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Archived Projects</h2>
          <p className="text-xs text-text-secondary mt-1">
            View and restore projects that have been archived across this workspace.
          </p>
        </div>

        <Link
          to="/projects"
          className="px-4 py-2 text-xs rounded-xl border border-border-primary bg-bg-secondary hover:bg-bg-tertiary font-medium text-text-primary transition-colors"
        >
          ← Active Projects
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <ProjectTableSkeleton rows={4} />
      ) : isError ? (
        <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-600 text-xs text-center">
          Failed to load archived projects.
        </div>
      ) : projects.length === 0 ? (
        <ProjectEmptyState
          title="No archived projects"
          description="Projects that are archived will appear here for audit and restoration."
        />
      ) : (
        <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-primary bg-bg-tertiary/50 text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                <th className="px-6 py-3">Key</th>
                <th className="px-6 py-3">Project Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Archived Date</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-primary">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-bg-tertiary/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-text-secondary uppercase">
                    {project.key}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-xs text-text-primary">{project.name}</p>
                    <p className="text-[10px] text-text-tertiary truncate max-w-xs">{project.description || 'No description'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-text-secondary">
                    {project.category || 'Engineering'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-text-tertiary">
                    {project.archivedAt ? new Date(project.archivedAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => restoreMutation.mutate(project._id)}
                        disabled={restoreMutation.isPending}
                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 transition-colors"
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => setDeletingProject(project)}
                        className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteProjectModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        organizationId={organizationId}
        workspaceId={workspaceId}
        project={deletingProject}
      />
    </div>
  );
}
