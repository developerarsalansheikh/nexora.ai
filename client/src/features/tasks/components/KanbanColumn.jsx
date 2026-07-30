import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import KanbanCard from './KanbanCard';

const COLUMN_STYLES = {
  backlog: { icon: '📋', accent: 'border-t-slate-400', dotColor: 'bg-slate-400' },
  todo: { icon: '🎯', accent: 'border-t-text-tertiary', dotColor: 'bg-text-tertiary' },
  in_progress: { icon: '⚡', accent: 'border-t-brand-500', dotColor: 'bg-brand-500' },
  in_review: { icon: '🔍', accent: 'border-t-amber-500', dotColor: 'bg-amber-500' },
  done: { icon: '✅', accent: 'border-t-emerald-500', dotColor: 'bg-emerald-500' },
  cancelled: { icon: '🚫', accent: 'border-t-rose-500', dotColor: 'bg-rose-500' },
  duplicate: { icon: '📄', accent: 'border-t-gray-500', dotColor: 'bg-gray-500' },
};

export default function KanbanColumn({
  columnId,
  title,
  tasks,
  onCardClick,
  onAddTask,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: { type: 'column', columnId },
  });

  const styles = COLUMN_STYLES[columnId] || COLUMN_STYLES.todo;
  const taskIds = tasks.map((t) => t._id);

  const displayTitle = title
    ? title.charAt(0).toUpperCase() + title.slice(1)
    : columnId.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div
      className={`rounded-2xl bg-bg-secondary/40 backdrop-blur-md border border-border-primary flex flex-col transition-all duration-300 border-t-2 ${styles.accent} ${
        isOver ? 'ring-2 ring-brand-500/40 bg-brand-500/5' : ''
      }`}
      style={{ minHeight: isCollapsed ? 'auto' : '500px' }}
    >
      {/* Column Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{styles.icon}</span>
            <h3 className="text-sm font-semibold text-text-primary">{displayTitle}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary font-mono border border-border-primary">
              {tasks.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="text-text-tertiary hover:text-text-primary text-xs p-1 rounded-lg hover:bg-bg-tertiary transition-colors"
              title={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? '▶' : '▼'}
            </button>
            <button
              onClick={() => onAddTask?.(columnId)}
              className="text-text-tertiary hover:text-brand-500 text-sm p-1 rounded-lg hover:bg-brand-500/10 transition-colors"
              title="Add task"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Sortable Card Container */}
      {!isCollapsed && (
        <div ref={setNodeRef} className="flex-1 px-3 pb-3">
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5 min-h-[60px]">
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <KanbanCard
                      task={task}
                      onClick={() => onCardClick?.(task)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Drop placeholder when column is empty */}
              {tasks.length === 0 && (
                <div className="h-20 rounded-xl border border-dashed border-border-primary flex items-center justify-center text-text-tertiary text-xs">
                  Drop issues here
                </div>
              )}
            </div>
          </SortableContext>
        </div>
      )}
    </div>
  );
}
