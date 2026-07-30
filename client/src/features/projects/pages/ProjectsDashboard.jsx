import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useProjects } from '../api/useProjects';
import ProjectCard from '../components/ProjectCard';
import ProjectListItem from '../components/ProjectListItem';
import ProjectFilterToolbar from '../components/ProjectFilterToolbar';
import { ProjectGridSkeleton, ProjectTableSkeleton } from '../components/ProjectSkeletons';
import ProjectEmptyState from '../components/ProjectEmptyState';
import CreateProjectModal from '../components/CreateProjectModal';
import EditProjectModal from '../components/EditProjectModal';
import DeleteProjectModal from '../components/DeleteProjectModal';
import DuplicateProjectModal from '../components/DuplicateProjectModal';

export default function ProjectsDashboard() {
  const { user, membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const workspaceId =
    membership?.workspaceId ||
    user?.currentWorkspaceId ||
    localStorage.getItem('nexora_workspace_id') ||
    null;

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [visibility, setVisibility] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [duplicatingProject, setDuplicatingProject] = useState(null);

  const { data, isLoading, isError } = useProjects(organizationId, workspaceId, {
    search,
    status,
    visibility,
    category,
    sort,
    page,
    limit: 12,
    isArchived: false,
    isFavorite: onlyFavorites ? true : undefined,
  });

  const projects = Array.isArray(data?.docs)
    ? data.docs
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data)
    ? data
    : [];
  const totalDocs = data?.totalDocs || projects.length;
  const totalPages = data?.totalPages || 1;

  const isAdminOrOwner = ['admin', 'owner', 'project_manager'].includes(membership?.role);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Projects & Initiatives</h2>
          <p className="text-xs text-text-secondary mt-1">
            Overview of active projects, metrics, and team collaboration across your workspace.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/projects/archived"
            className="px-3.5 py-2 text-xs rounded-xl border border-border-primary bg-bg-secondary hover:bg-bg-tertiary font-medium text-text-secondary transition-colors"
          >
            📦 Archived Projects
          </Link>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity"
          >
            + Create Project
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <ProjectFilterToolbar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        visibility={visibility}
        setVisibility={setVisibility}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onlyFavorites={onlyFavorites}
        setOnlyFavorites={setOnlyFavorites}
      />

      {/* Main Content Area */}
      {isLoading ? (
        viewMode === 'grid' ? <ProjectGridSkeleton count={6} /> : <ProjectTableSkeleton rows={5} />
      ) : isError ? (
        <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-600 text-xs text-center">
          Failed to load projects. Please check your network connection or permissions.
        </div>
      ) : projects.length === 0 ? (
        <ProjectEmptyState
          isFilterEmpty={!!(search || status || visibility || category || onlyFavorites)}
          onAction={() => setIsCreateModalOpen(true)}
          actionText="+ Create Project"
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              organizationId={organizationId}
              workspaceId={workspaceId}
              onEdit={(proj) => setEditingProject(proj)}
              onDelete={(proj) => setDeletingProject(proj)}
              onDuplicate={(proj) => setDuplicatingProject(proj)}
              currentUserId={user?._id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-primary bg-bg-tertiary/50 text-[10px] uppercase font-bold text-text-tertiary tracking-wider">
                  <th className="px-6 py-3 w-10">★</th>
                  <th className="px-6 py-3">Key</th>
                  <th className="px-6 py-3">Project Name</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Owner</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary">
                {projects.map((project) => (
                  <ProjectListItem
                    key={project._id}
                    project={project}
                    organizationId={organizationId}
                    workspaceId={workspaceId}
                    onEdit={(proj) => setEditingProject(proj)}
                    onDelete={(proj) => setDeletingProject(proj)}
                    onDuplicate={(proj) => setDuplicatingProject(proj)}
                    currentUserId={user?._id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border-primary text-xs">
          <span className="text-text-tertiary">
            Showing Page <span className="font-bold text-text-primary">{page}</span> of{' '}
            <span className="font-bold text-text-primary">{totalPages}</span> ({totalDocs} total projects)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-border-primary bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-border-primary bg-bg-secondary hover:bg-bg-tertiary disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        organizationId={organizationId}
        workspaceId={workspaceId}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        organizationId={organizationId}
        workspaceId={workspaceId}
        project={editingProject}
      />

      <DeleteProjectModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        organizationId={organizationId}
        workspaceId={workspaceId}
        project={deletingProject}
      />

      <DuplicateProjectModal
        isOpen={!!duplicatingProject}
        onClose={() => setDuplicatingProject(null)}
        organizationId={organizationId}
        workspaceId={workspaceId}
        project={duplicatingProject}
      />
    </div>
  );
}
