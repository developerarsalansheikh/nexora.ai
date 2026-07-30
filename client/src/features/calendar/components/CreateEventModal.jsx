import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EVENT_TYPES = [
  { value: 'event', label: 'Team Event', emoji: '📌', color: '#6366f1' },
  { value: 'milestone', label: 'Milestone', emoji: '🎯', color: '#f59e0b' },
  { value: 'deadline', label: 'Deadline', emoji: '⏳', color: '#ef4444' },
  { value: 'personal', label: 'Personal', emoji: '👤', color: '#10b981' },
];

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f59e0b', '#10b981', '#06b6d4', '#3b82f6',
];

/**
 * Utility: get today's datetime-local string (YYYY-MM-DDTHH:mm)
 */
const todayLocal = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export default function CreateEventModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('event');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#6366f1');

  // Reset + pre-fill dates every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setType('event');
      setColor('#6366f1');
      const now = todayLocal();
      setStartDate(now);
      // Default end = 1 hour later
      const later = new Date();
      later.setHours(later.getHours() + 1);
      const pad = (n) => String(n).padStart(2, '0');
      setEndDate(
        `${later.getFullYear()}-${pad(later.getMonth() + 1)}-${pad(later.getDate())}T${pad(later.getHours())}:${pad(later.getMinutes())}`
      );
    }
  }, [isOpen]);

  const selectedType = EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color,
    });
  };

  const handleTypeChange = (val) => {
    setType(val);
    const found = EVENT_TYPES.find((t) => t.value === val);
    if (found) setColor(found.color);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="create-event-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            key="create-event-panel"
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-border-primary bg-bg-secondary shadow-2xl overflow-hidden"
            style={{ boxShadow: `0 0 60px ${color}30, 0 25px 50px rgba(0,0,0,0.5)` }}
          >
            {/* Gradient top bar using the event color */}
            <div
              className="h-1.5 w-full transition-colors duration-300"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }}
            />

            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b border-border-primary flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-md"
                  style={{ background: `${color}20`, border: `1px solid ${color}40` }}
                >
                  {selectedType.emoji}
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Create New Event</h2>
                  <p className="text-[11px] text-text-tertiary mt-0.5">Add to workspace calendar</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all text-sm"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
                  Event Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sprint planning, Product demo, Release..."
                  required
                  autoFocus
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-border-primary bg-bg-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                />
              </div>

              {/* Type chips */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">Event Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {EVENT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => handleTypeChange(t.value)}
                      className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-2xl border text-center transition-all"
                      style={{
                        borderColor: type === t.value ? t.color : 'var(--border-primary)',
                        background: type === t.value ? `${t.color}15` : 'var(--bg-primary)',
                        color: type === t.value ? t.color : 'var(--text-tertiary)',
                      }}
                    >
                      <span className="text-base">{t.emoji}</span>
                      <span className="text-[10px] font-semibold leading-tight">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-xl transition-all"
                      style={{
                        backgroundColor: c,
                        outline: color === c ? `3px solid ${c}` : 'none',
                        outlineOffset: '2px',
                        transform: color === c ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                  ))}
                  {/* Custom color picker */}
                  <label className="w-7 h-7 rounded-xl border-2 border-dashed border-border-primary cursor-pointer flex items-center justify-center text-[10px] text-text-tertiary hover:border-brand-500 transition-colors overflow-hidden" title="Custom color">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="opacity-0 w-0 h-0 absolute"
                    />
                    ✎
                  </label>
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
                    Start <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
                    End <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    min={startDate}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
                  Description <span className="text-text-tertiary font-normal">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details, meeting link, agenda..."
                  rows={3}
                  className="w-full px-4 py-3 text-sm rounded-2xl border border-border-primary bg-bg-primary text-text-primary placeholder-text-tertiary focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-all"
                />
              </div>

              {/* Preview pill */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                style={{ borderColor: `${color}40`, background: `${color}08` }}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {title || 'Untitled Event'}
                  </p>
                  <p className="text-[10px] text-text-tertiary">
                    {selectedType.emoji} {selectedType.label}
                    {startDate && ` · ${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: `${color}20`, color }}
                >
                  Preview
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-primary">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs rounded-2xl border border-border-primary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !title.trim() || !startDate || !endDate}
                  className="px-6 py-2.5 text-xs rounded-2xl font-bold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                    boxShadow: `0 4px 16px ${color}40`,
                  }}
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      Create Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
