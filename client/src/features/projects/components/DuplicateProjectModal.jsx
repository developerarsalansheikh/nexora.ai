import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDuplicateProject } from '../api/useProjects';

export default function DuplicateProjectModal({ isOpen, onClose, organizationId, workspaceId, project }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');

  const duplicateMutation = useDuplicateProject(organizationId, workspaceId);

  useEffect(() => {
    if (project && isOpen) {
      setName(`Copy of ${project.name}`);
      const proposedKey = `${project.key}2`.slice(0, 10);
      setKey(proposedKey);
    }
  }, [project, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!project || !name.trim() || !key.trim()) return;

    duplicateMutation.mutate(
      {
        projectId: project._id,
        name,
        key: key.toUpperCase(),
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md p-6 rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-text-primary">Duplicate Project</h2>
                <p className="text-xs text-text-secondary">Clone metadata, categories, and settings from "{project.name}".</p>
              </div>
              <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-sm font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-tertiary">New Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-tertiary">New Project Key *</label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 10))}
                  required
                  maxLength={10}
                  className="w-full px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-primary">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={duplicateMutation.isPending}
                  className="px-4 py-2 text-xs rounded-xl font-medium border border-border-primary hover:bg-bg-tertiary text-text-secondary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={duplicateMutation.isPending || !name.trim() || !key.trim()}
                  className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity disabled:opacity-50"
                >
                  {duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
