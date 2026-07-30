import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useWorkspaces, useDeleteWorkspace } from '../api/useWorkspaces';
import CreateEditWorkspaceModal from '../components/CreateEditWorkspaceModal';

export default function WorkspaceList() {
  const { membership } = useAuth();
  const organizationId = membership?.organizationId || localStorage.getItem('nexora_org_id');
  const { data: workspaces, isLoading, isError } = useWorkspaces(organizationId);
  const deleteMutation = useDeleteWorkspace(organizationId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  const isAdminOrOwner = ['admin', 'owner'].includes(membership?.role);

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingWorkspace(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      deleteMutation.mutate(id);
    }
  };

  const workspaceList = Array.isArray(workspaces)
    ? workspaces
    : (workspaces?.workspaces ?? workspaces?.docs ?? []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">Workspaces</h2>
          <p className="text-xs text-text-secondary mt-1">Manage, configure, and monitor active initiatives across your organization.</p>
        </div>
        {isAdminOrOwner && (
          <button
            onClick={handleCreate}
            className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity"
          >
            + Create Workspace
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10 text-text-tertiary">Loading workspaces...</div>
      ) : isError ? (
        <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-500/5 text-rose-600 text-xs text-center">
          Failed to load workspaces. Please refresh the page.
        </div>
      ) : workspaceList.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border-primary rounded-2xl bg-bg-secondary/20">
          <p className="text-text-secondary text-sm">No workspaces found.</p>
          {isAdminOrOwner && (
            <button
              onClick={handleCreate}
              className="mt-4 px-4 py-2 text-xs rounded-xl bg-bg-secondary hover:bg-bg-tertiary font-medium transition-colors border border-border-primary text-text-primary"
            >
              Create your first workspace
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceList.map((workspace, i) => (
            <motion.div
              key={workspace._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md p-6 flex flex-col justify-between hover:border-brand-500/30 transition-all duration-300 group cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md bg-bg-tertiary text-text-secondary border border-border-primary uppercase">
                    {workspace.slug || workspace.name.substring(0, 3)}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 capitalize">
                    {workspace.visibility}
                  </span>
                </div>

                <h3 className="text-base font-bold text-text-primary group-hover:text-brand-500 transition-colors">{workspace.name}</h3>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed min-h-[40px] line-clamp-2">
                  {workspace.description || 'No description provided.'}
                </p>
              </div>

              {isAdminOrOwner && (
                <div className="mt-6 pt-4 border-t border-border-primary flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(workspace); }}
                    className="text-[10px] font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(workspace._id); }}
                    className="text-[10px] font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <CreateEditWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organizationId={organizationId}
        initialData={editingWorkspace}
      />
    </div>
  );
}
