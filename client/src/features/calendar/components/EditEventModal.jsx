import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * EditEventModal — Edit or delete an existing calendar event.
 * Props:
 *   event       — the event object to edit (or null)
 *   isOpen      — boolean
 *   onClose     — fn()
 *   onUpdate    — fn(eventId, payload)
 *   onDelete    — fn(eventId)
 *   isUpdating  — boolean
 *   isDeleting  — boolean
 */
export default function EditEventModal({
  event,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('event');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sync form fields whenever event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setType(event.type || 'event');
      setColor(event.color || '#6366f1');
      // Convert ISO dates to datetime-local input format (YYYY-MM-DDTHH:mm)
      const toLocal = (iso) => {
        if (!iso) return '';
        const d = new Date(iso);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };
      setStartDate(toLocal(event.startDate));
      setEndDate(toLocal(event.endDate));
      setConfirmDelete(false);
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) return;
    onUpdate(event._id, {
      title: title.trim(),
      description: description.trim(),
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color,
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(event._id);
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="edit-event-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md px-4"
          onClick={onClose}
        >
          <motion.div
            key="edit-event-panel"
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-border-primary bg-bg-secondary shadow-2xl overflow-hidden"
          >
          {/* Header */}
          <div className="p-5 border-b border-border-primary bg-gradient-to-r from-brand-600/5 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500 text-sm">
                ✏️
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">Edit Event</h2>
                <p className="text-[10px] text-text-tertiary">Modify event details below</p>
              </div>
            </div>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-primary text-lg transition-colors">
              ✕
            </button>
          </div>

          {/* Color strip indicator */}
          <div className="h-1 w-full" style={{ backgroundColor: color }} />

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title..."
                required
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            {/* Type + Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500"
                >
                  <option value="event">📌 Team Event</option>
                  <option value="milestone">🎯 Milestone</option>
                  <option value="personal">👤 Personal Event</option>
                  <option value="deadline">⏳ Deadline</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Color</label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-[42px] px-1 py-1 rounded-xl border border-border-primary bg-bg-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Start Date</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5">End Date</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description..."
                rows={2}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border-primary flex items-center justify-between gap-3">
              {/* Delete */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`px-4 py-2 text-xs rounded-xl font-semibold transition-colors ${
                  confirmDelete
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'border border-rose-500/30 text-rose-500 hover:bg-rose-500/10'
                } disabled:opacity-50`}
              >
                {isDeleting ? 'Deleting...' : confirmDelete ? '⚠️ Confirm Delete' : '🗑️ Delete'}
              </button>

              {confirmDelete && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-2 text-xs rounded-xl border border-border-primary text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel Delete
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs rounded-xl border border-border-primary text-text-secondary hover:text-text-primary font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !title.trim() || !startDate || !endDate}
                  className="px-5 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] text-white font-semibold shadow-md shadow-brand-500/10 hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isUpdating ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
