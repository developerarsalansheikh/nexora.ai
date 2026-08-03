import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SprintPlanningModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      goal: goal.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
    });
    setName('');
    setGoal('');
    setStartDate('');
    setEndDate('');
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
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl border border-border-primary bg-bg-secondary shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border-primary bg-gradient-to-r from-brand-600/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 text-sm">
                🏃
              </div>
              <h2 className="text-base font-bold text-text-primary">Create Sprint</h2>
            </div>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-lg">
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Sprint Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sprint 24 — Performance"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Sprint Goal</label>
              <textarea
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What is the objective of this sprint?"
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-5 border-t border-border-primary flex justify-end gap-3">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-xs rounded-xl border border-border-primary text-text-secondary hover:text-text-primary font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !name.trim()}
              className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] text-white font-semibold shadow-md shadow-brand-500/10 hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Sprint'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
