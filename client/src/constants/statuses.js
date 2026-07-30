/**
 * Client-side status badge styles for tasks, projects, sprints, and priority.
 * Maps backend enum values to Tailwind CSS class sets.
 */

export const TASK_STATUS = Object.freeze({
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  DONE: 'done',
  CANCELLED: 'cancelled',
});

export const PRIORITY = Object.freeze({
  NO_PRIORITY: 'no_priority',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
});

export const PRIORITY_STYLES = Object.freeze({
  no_priority: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'No Priority' },
  low: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Low' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Medium' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', label: 'High' },
  urgent: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Urgent' },
});

export const TASK_STATUS_STYLES = Object.freeze({
  backlog: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'Backlog' },
  todo: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'To Do' },
  in_progress: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', label: 'In Progress' },
  in_review: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'In Review' },
  done: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Done' },
  cancelled: { bg: 'bg-slate-600/10', text: 'text-slate-500', border: 'border-slate-600/20', label: 'Cancelled' },
});

export const PROJECT_STATUS_STYLES = Object.freeze({
  planning: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Planning' },
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', label: 'Active' },
  on_hold: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'On Hold' },
  completed: { bg: 'bg-brand-500/10', text: 'text-brand-400', border: 'border-brand-500/20', label: 'Completed' },
  archived: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'Archived' },
  cancelled: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', label: 'Cancelled' },
});
