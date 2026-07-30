import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateWorkspace, useUpdateWorkspace } from '../api/useWorkspaces';

export default function CreateEditWorkspaceModal({ isOpen, onClose, organizationId, initialData }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useCreateWorkspace(organizationId);
  const updateMutation = useUpdateWorkspace(organizationId);

  const isEdit = !!initialData;
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || '');
      setDescription(initialData?.description || '');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(
        { workspaceId: initialData._id, payload: { name, description } },
        { onSuccess: onClose }
      );
    } else {
      createMutation.mutate({ name, description }, { onSuccess: onClose });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-2xl bg-bg-secondary border border-border-primary shadow-xl"
          >
            <h2 className="text-lg font-bold text-text-primary mb-1">
              {isEdit ? 'Edit Workspace' : 'Create Workspace'}
            </h2>
            <p className="text-xs text-text-secondary mb-6">
              {isEdit ? 'Update workspace details.' : 'Add a new workspace to your organization.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-tertiary">Workspace Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Engineering, Marketing"
                  required
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-tertiary">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Briefly describe the purpose of this workspace"
                  rows={3}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500/80 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-border-primary">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="px-4 py-2 text-xs rounded-xl font-medium border border-border-primary hover:bg-bg-tertiary text-text-secondary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !name.trim()}
                  className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
