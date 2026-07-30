import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateProject } from '../api/useProjects';

export default function CreateProjectModal({ isOpen, onClose, organizationId, workspaceId }) {
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [visibility, setVisibility] = useState('internal');
  const [status, setStatus] = useState('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState('');

  const createMutation = useCreateProject(organizationId, workspaceId);

  // Auto-generate project key suggestion from name if key hasn't been manually edited
  const handleNameChange = (e) => {
    const val = e.target.value;
    setName(val);
    if (!key || key.length <= 4) {
      const generatedKey = val
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase()
        .slice(0, 4);
      setKey(generatedKey);
    }
  };

  useEffect(() => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setDateError('Start date cannot be after end date.');
    } else {
      setDateError('');
    }
  }, [startDate, endDate]);

  const [createdProject, setCreatedProject] = useState(null);

  const resetForm = () => {
    setName('');
    setKey('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setCreatedProject(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (dateError) return;

    const formattedKey = key.toUpperCase();

    createMutation.mutate(
      {
        name,
        key: formattedKey,
        description,
        category,
        visibility,
        status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
      {
        onSuccess: (newProj) => {
          setCreatedProject({
            _id: newProj?._id,
            name: newProj?.name || name,
            key: newProj?.key || formattedKey,
          });
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl p-6 rounded-2xl bg-bg-secondary border border-border-primary shadow-2xl my-8"
          >
            {createdProject ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
                  🎉
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Project Created Successfully!</h2>
                  <p className="text-xs text-text-secondary mt-1">Your new project is live and ready in this workspace.</p>
                </div>
                <div className="p-4 rounded-xl bg-bg-primary border border-border-primary text-left max-w-md mx-auto space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-text-tertiary">Project Name:</span>
                    <span className="font-bold text-text-primary">{createdProject.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-text-tertiary">Project Key:</span>
                    <span className="font-mono font-bold text-brand-400 uppercase">{createdProject.key}</span>
                  </div>
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity"
                  >
                    Awesome, Got It!
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">Create New Project</h2>
                    <p className="text-xs text-text-secondary">Initialize a new project initiative in this workspace.</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-text-tertiary hover:text-text-primary text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Project Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. NextGen Core API"
                    required
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Project Key *</label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value.toUpperCase().slice(0, 10))}
                    placeholder="e.g. API"
                    required
                    maxLength={10}
                    className="w-full px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-text-tertiary">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the scope and objectives of this project..."
                  rows={3}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Visibility</label>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="internal">Internal (Workspace members)</option>
                    <option value="public">Public (Organization members)</option>
                    <option value="private">Private (Restricted members only)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Initial Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-text-tertiary">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                  />
                </div>
              </div>

              {dateError && (
                <p className="text-[11px] text-rose-500 font-semibold mt-1">{dateError}</p>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-primary">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs rounded-xl font-medium border border-border-primary hover:bg-bg-tertiary text-text-secondary transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !name.trim() || !key.trim() || !!dateError}
                  className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating Project...' : 'Create Project'}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
