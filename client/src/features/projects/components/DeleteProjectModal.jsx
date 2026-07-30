import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDeleteProject } from '../api/useProjects';

export default function DeleteProjectModal({ isOpen, onClose, organizationId, workspaceId, project, onDeleted }) {
  const deleteMutation = useDeleteProject(organizationId, workspaceId);

  const handleDelete = () => {
    if (!project) return;
    deleteMutation.mutate(project._id, {
      onSuccess: () => {
        onClose();
        if (onDeleted) onDeleted();
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-2xl bg-bg-secondary border border-rose-500/20 shadow-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center text-xl mb-4 font-bold">
              ⚠️
            </div>
            <h2 className="text-base font-bold text-text-primary mb-1">
              Delete Project "{project.name}"?
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed mb-6">
              Are you sure you want to delete this project? This will remove the project metadata, settings, and member access. This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-border-primary">
              <button
                type="button"
                onClick={onClose}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-xs rounded-xl font-medium border border-border-primary hover:bg-bg-tertiary text-text-secondary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 font-medium text-white shadow-md shadow-rose-600/10 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Project'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
