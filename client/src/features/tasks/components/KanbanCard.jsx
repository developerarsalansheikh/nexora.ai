import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const PRIORITY_STYLES = {
  urgent: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: '🚨' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: '🔴' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: '🟡' },
  low: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20', icon: '🔵' },
  no_priority: { bg: 'bg-bg-tertiary', text: 'text-text-tertiary', border: 'border-border-primary', icon: '⚪' },
};

const TYPE_ICONS = {
  story: '📖',
  task: '✅',
  bug: '🐛',
  epic: '⚡',
  improvement: '🚀',
};

export default function KanbanCard({ task, onClick, overlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: 'task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const pr = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.no_priority;
  const typeIcon = TYPE_ICONS[task.type] || '✅';
  const assignee = task.assignee || (task.assignees && task.assignees[0]);
  const checklistTotal = task.checklist?.length || 0;
  const checklistDone = task.checklist?.filter((c) => c.completed).length || 0;

  const cardClasses = overlay
    ? 'p-3.5 rounded-xl border border-brand-500/40 bg-bg-secondary shadow-xl shadow-brand-500/10 cursor-grabbing scale-[1.03]'
    : 'p-3.5 rounded-xl border border-border-primary bg-bg-secondary/80 hover:border-brand-500/30 transition-all duration-200 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md group';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className={cardClasses} onClick={onClick}>
        {/* Top Row: Type + Key + Priority Badge */}
        <div className="flex justify-between items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">{typeIcon}</span>
            <span className="text-[10px] font-semibold font-mono text-text-tertiary tracking-wider">
              {task.key}
            </span>
          </div>
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${pr.bg} ${pr.text} border ${pr.border}`}
          >
            {pr.icon} {task.priority?.replace('_', ' ')}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-xs text-text-secondary font-medium leading-relaxed mb-3 group-hover:text-text-primary transition-colors line-clamp-2">
          {task.title}
        </h4>

        {/* Labels row */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.slice(0, 3).map((label, idx) => (
              <span
                key={label._id || idx}
                className="text-[9px] px-1.5 py-0.5 rounded-md font-medium border"
                style={{
                  backgroundColor: `${label.color}15`,
                  color: label.color,
                  borderColor: `${label.color}30`,
                }}
              >
                {label.name}
              </span>
            ))}
            {task.labels.length > 3 && (
              <span className="text-[9px] text-text-tertiary font-mono">
                +{task.labels.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: Assignee + Metadata */}
        <div className="flex justify-between items-center pt-2 border-t border-border-primary">
          <div className="flex items-center gap-2">
            {assignee ? (
              <>
                {assignee.avatar ? (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-border-primary"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[8px] font-bold flex items-center justify-center text-white">
                    {assignee.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <span className="text-[10px] text-text-secondary">{assignee.name?.split(' ')[0]}</span>
              </>
            ) : (
              <span className="text-[10px] text-text-tertiary italic">Unassigned</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 text-[10px] text-text-tertiary">
            {/* Story Points */}
            {task.storyPoints > 0 && (
              <span className="font-mono" title="Story Points">
                🎯 {task.storyPoints}
              </span>
            )}

            {/* Checklist progress */}
            {checklistTotal > 0 && (
              <span className="font-mono" title={`Checklist: ${checklistDone}/${checklistTotal}`}>
                ☑ {checklistDone}/{checklistTotal}
              </span>
            )}

            {/* Due Date */}
            {task.dueDate && (
              <span
                className={`font-mono ${
                  new Date(task.dueDate) < new Date() ? 'text-rose-400' : ''
                }`}
                title={`Due: ${new Date(task.dueDate).toLocaleDateString()}`}
              >
                📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
