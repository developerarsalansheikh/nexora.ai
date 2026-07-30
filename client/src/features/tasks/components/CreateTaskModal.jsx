import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  defaultStatus = 'backlog',
}) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'no_priority',
    type: 'task',
    assignee: '',
    startDate: '',
    dueDate: '',
    estimatedHours: '',
    storyPoints: '',
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      type: form.type,
    };

    if (form.startDate) payload.startDate = form.startDate;
    if (form.dueDate) payload.dueDate = form.dueDate;
    if (form.estimatedHours) payload.estimatedHours = Number(form.estimatedHours);
    if (form.storyPoints) payload.storyPoints = Number(form.storyPoints);

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-border-primary bg-bg-secondary shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border-primary bg-gradient-to-r from-brand-600/5 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 text-sm">
                  ✏️
                </div>
                <h2 className="text-base font-bold text-text-primary">Create Task</h2>
              </div>
              <button
                onClick={onClose}
                className="text-text-tertiary hover:text-text-primary text-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="Enter task title..."
                required
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={handleChange('description')}
                placeholder="Describe the task..."
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 transition-colors resize-none"
              />
            </div>

            {/* Type & Status Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={handleChange('type')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="task">✅ Task</option>
                  <option value="story">📖 Story</option>
                  <option value="bug">🐛 Bug</option>
                  <option value="epic">⚡ Epic</option>
                  <option value="improvement">🚀 Improvement</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={handleChange('status')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="backlog">📋 Backlog</option>
                  <option value="todo">🎯 To Do</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="in_review">🔍 In Review</option>
                  <option value="done">✅ Done</option>
                </select>
              </div>
            </div>

            {/* Priority & Story Points Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Priority</label>
                <select
                  value={form.priority}
                  onChange={handleChange('priority')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                >
                  <option value="no_priority">⚪ No Priority</option>
                  <option value="low">🔵 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                  <option value="urgent">🚨 Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Story Points</label>
                <input
                  type="number"
                  min="0"
                  value={form.storyPoints}
                  onChange={handleChange('storyPoints')}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Dates Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={handleChange('startDate')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={handleChange('dueDate')}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="w-1/2">
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Estimated Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={form.estimatedHours}
                onChange={handleChange('estimatedHours')}
                placeholder="0"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="p-5 border-t border-border-primary flex justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs rounded-xl border border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !form.title.trim()}
              className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] text-white font-semibold shadow-md shadow-brand-500/10 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
