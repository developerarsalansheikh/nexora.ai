import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useTaskDetails,
  useUpdateTask,
  useSubTasks,
  useTaskComments,
  useAddComment,
  useToggleChecklistItem,
  useAddChecklistItem,
  useAddWorkLog,
  useToggleWatcher,
  useDeleteTask,
} from '../api/useTasks';
import { useAuth } from '../../../context/AuthContext';

const PRIORITY_STYLES = {
  urgent: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  low: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/20' },
  no_priority: { bg: 'bg-bg-tertiary', text: 'text-text-tertiary', border: 'border-border-primary' },
};

const TYPE_ICONS = { story: '📖', task: '✅', bug: '🐛', epic: '⚡', improvement: '🚀' };

export default function TaskDetailsDrawer({
  isOpen,
  onClose,
  taskId,
  organizationId,
  workspaceId,
  projectId,
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [newComment, setNewComment] = useState('');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [workLogHours, setWorkLogHours] = useState('');
  const [workLogComment, setWorkLogComment] = useState('');

  // ─── Data Queries ─────────────────────────────────────────────────────────
  const { data: task, isLoading } = useTaskDetails(organizationId, workspaceId, projectId, taskId);
  const { data: subtasks } = useSubTasks(organizationId, workspaceId, projectId, taskId);
  const { data: comments } = useTaskComments(organizationId, workspaceId, projectId, taskId);

  // ─── Mutations ────────────────────────────────────────────────────────────
  const updateTask = useUpdateTask(organizationId, workspaceId, projectId);
  const addComment = useAddComment(organizationId, workspaceId, projectId, taskId);
  const toggleChecklist = useToggleChecklistItem(organizationId, workspaceId, projectId, taskId);
  const addChecklistItem = useAddChecklistItem(organizationId, workspaceId, projectId, taskId);
  const addWorkLog = useAddWorkLog(organizationId, workspaceId, projectId, taskId);
  const toggleWatcher = useToggleWatcher(organizationId, workspaceId, projectId, taskId);
  const deleteTask = useDeleteTask(organizationId, workspaceId, projectId);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleStatusChange = (status) => {
    updateTask.mutate({ taskId, payload: { status } });
  };

  const handlePriorityChange = (priority) => {
    updateTask.mutate({ taskId, payload: { priority } });
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addComment.mutate(newComment.trim());
    setNewComment('');
  };

  const handleToggleChecklist = (itemId, completed) => {
    toggleChecklist.mutate({ itemId, completed: !completed });
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    addChecklistItem.mutate(newChecklistTitle.trim());
    setNewChecklistTitle('');
  };

  const handleAddWorkLog = (e) => {
    e.preventDefault();
    const hrs = parseFloat(workLogHours);
    if (isNaN(hrs) || hrs <= 0) return;
    addWorkLog.mutate({ hours: hrs, comment: workLogComment.trim() });
    setWorkLogHours('');
    setWorkLogComment('');
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this task? This action is irreversible.')) {
      deleteTask.mutate(taskId);
      onClose();
    }
  };

  if (!isOpen) return null;

  const TABS = [
    { key: 'details', label: 'Details', icon: '📋' },
    { key: 'comments', label: 'Comments', icon: '💬' },
    { key: 'checklist', label: 'Checklist', icon: '☑️' },
    { key: 'time', label: 'Time', icon: '⏱️' },
    { key: 'subtasks', label: 'Subtasks', icon: '📂' },
  ];

  const pr = task ? PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.no_priority : PRIORITY_STYLES.no_priority;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="task-drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <motion.div
        key="task-drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-bg-secondary border-l border-border-primary shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Loading State */}
        {isLoading || !task ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* Drawer Header */}
            <div className="p-5 border-b border-border-primary bg-gradient-to-r from-brand-600/5 to-transparent shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">{TYPE_ICONS[task.type] || '✅'}</span>
                  <span className="text-xs font-mono font-bold text-text-tertiary tracking-wider">
                    {task.key}
                  </span>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md ${pr.bg} ${pr.text} border ${pr.border}`}>
                    {task.priority?.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWatcher.mutate()}
                    className="p-1.5 rounded-lg text-xs hover:bg-bg-tertiary transition-colors text-text-tertiary hover:text-text-primary"
                    title="Toggle Watch"
                  >
                    👁️
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 rounded-lg text-xs hover:bg-rose-500/10 text-text-tertiary hover:text-rose-400 transition-colors"
                    title="Delete Task"
                  >
                    🗑️
                  </button>
                  <button
                    onClick={onClose}
                    className="text-text-tertiary hover:text-text-primary text-lg transition-colors ml-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-sm font-bold text-text-primary leading-snug mb-2">{task.title}</h2>

              {/* Quick Actions Row */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-2.5 py-1 text-[10px] rounded-lg border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 font-semibold"
                >
                  <option value="backlog">📋 Backlog</option>
                  <option value="todo">🎯 To Do</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="in_review">🔍 In Review</option>
                  <option value="done">✅ Done</option>
                </select>

                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="px-2.5 py-1 text-[10px] rounded-lg border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 font-semibold"
                >
                  <option value="no_priority">⚪ No Priority</option>
                  <option value="low">🔵 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                  <option value="urgent">🚨 Urgent</option>
                </select>

                {/* Assignee avatar */}
                {task.assignee ? (
                  <div className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg border border-border-primary bg-bg-primary">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[7px] font-bold flex items-center justify-center text-white">
                      {task.assignee.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-text-secondary">{task.assignee.name?.split(' ')[0]}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 px-5 pt-3 pb-0 shrink-0">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 text-[10px] font-semibold rounded-t-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-bg-primary border border-border-primary border-b-transparent text-brand-500'
                      : 'text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary/50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 border-t border-border-primary">
              {/* ─── Details Tab ───────────────────────────────────────────── */}
              {activeTab === 'details' && (
                <div className="space-y-5">
                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-bold text-text-secondary mb-2">📝 Description</h3>
                    <div className="p-3 rounded-xl border border-border-primary bg-bg-primary text-xs text-text-secondary leading-relaxed min-h-[80px]">
                      {task.description || <span className="text-text-tertiary italic">No description provided.</span>}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem label="Type" value={`${TYPE_ICONS[task.type] || ''} ${task.type}`} />
                    <InfoItem label="Reporter" value={task.reporter?.name || 'Unknown'} />
                    <InfoItem label="Story Points" value={task.storyPoints || '—'} />
                    <InfoItem
                      label="Due Date"
                      value={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                    />
                    <InfoItem
                      label="Start Date"
                      value={task.startDate ? new Date(task.startDate).toLocaleDateString() : '—'}
                    />
                    <InfoItem label="Est. Hours" value={task.estimatedHours || '—'} />
                    <InfoItem label="Logged Hours" value={task.loggedHours || '0'} />
                    <InfoItem
                      label="Watchers"
                      value={task.watchers?.length || 0}
                    />
                  </div>

                  {/* Labels */}
                  {task.labels?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-text-secondary mb-2">🏷️ Labels</h3>
                      <div className="flex flex-wrap gap-1.5">
                        {task.labels.map((label, idx) => (
                          <span
                            key={label._id || idx}
                            className="text-[10px] px-2 py-0.5 rounded-md font-medium border"
                            style={{
                              backgroundColor: `${label.color}15`,
                              color: label.color,
                              borderColor: `${label.color}30`,
                            }}
                          >
                            {label.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dependencies */}
                  {task.dependencies?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-text-secondary mb-2">🔗 Dependencies</h3>
                      <div className="space-y-1.5">
                        {task.dependencies.map((dep, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 p-2 rounded-lg border border-border-primary bg-bg-primary text-xs"
                          >
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              dep.type === 'blocks' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                              {dep.type === 'blocks' ? 'Blocks' : 'Blocked by'}
                            </span>
                            <span className="text-text-primary font-mono">{dep.taskId?.key || dep.taskId}</span>
                            <span className="text-text-secondary">{dep.taskId?.title || ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Comments Tab ──────────────────────────────────────────── */}
              {activeTab === 'comments' && (
                <div className="space-y-4">
                  {/* Comment list */}
                  <div className="space-y-3 mb-4">
                    {comments && comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment._id} className="p-3 rounded-xl border border-border-primary bg-bg-primary">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[8px] font-bold flex items-center justify-center text-white">
                              {comment.authorId?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-[10px] font-semibold text-text-primary">
                              {comment.authorId?.name || 'Unknown'}
                            </span>
                            <span className="text-[9px] text-text-tertiary">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">{comment.content}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-text-tertiary italic text-center py-6">No comments yet. Be the first!</p>
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || addComment.isPending}
                      className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] text-white font-semibold hover:opacity-90 disabled:opacity-50"
                    >
                      Post
                    </button>
                  </form>
                </div>
              )}

              {/* ─── Checklist Tab ─────────────────────────────────────────── */}
              {activeTab === 'checklist' && (
                <div className="space-y-4">
                  {/* Progress bar */}
                  {task.checklist?.length > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-text-secondary">
                          Progress
                        </span>
                        <span className="text-[10px] font-mono text-text-tertiary">
                          {task.checklist.filter((c) => c.completed).length}/{task.checklist.length}
                        </span>
                      </div>
                      <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${(task.checklist.filter((c) => c.completed).length / task.checklist.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-2">
                    {task.checklist?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border-primary bg-bg-primary hover:border-brand-500/30 transition-colors group"
                      >
                        <button
                          onClick={() => handleToggleChecklist(item.id, item.completed)}
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            item.completed
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-border-primary hover:border-brand-500'
                          }`}
                        >
                          {item.completed && <span className="text-[8px]">✓</span>}
                        </button>
                        <span
                          className={`text-xs flex-1 ${
                            item.completed ? 'line-through text-text-tertiary' : 'text-text-secondary'
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}

                    {(!task.checklist || task.checklist.length === 0) && (
                      <p className="text-xs text-text-tertiary italic text-center py-4">No checklist items yet.</p>
                    )}
                  </div>

                  {/* Add Checklist Item */}
                  <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                    <input
                      type="text"
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      placeholder="Add checklist item..."
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500"
                    />
                    <button
                      type="submit"
                      disabled={!newChecklistTitle.trim()}
                      className="px-4 py-2 text-xs rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 font-semibold hover:bg-brand-500/20 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>
                </div>
              )}

              {/* ─── Time Tracking Tab ─────────────────────────────────────── */}
              {activeTab === 'time' && (
                <div className="space-y-5">
                  {/* Time overview cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-border-primary bg-bg-primary text-center">
                      <div className="text-lg font-bold text-brand-500">{task.estimatedHours || 0}h</div>
                      <div className="text-[10px] text-text-tertiary font-semibold">Estimated</div>
                    </div>
                    <div className="p-3 rounded-xl border border-border-primary bg-bg-primary text-center">
                      <div className={`text-lg font-bold ${
                        task.loggedHours > task.estimatedHours ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {task.loggedHours || 0}h
                      </div>
                      <div className="text-[10px] text-text-tertiary font-semibold">Logged</div>
                    </div>
                  </div>

                  {/* Progress */}
                  {task.estimatedHours > 0 && (
                    <div>
                      <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            task.loggedHours > task.estimatedHours
                              ? 'bg-gradient-to-r from-rose-500 to-rose-400'
                              : 'bg-gradient-to-r from-brand-600 to-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min((task.loggedHours / task.estimatedHours) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-text-tertiary mt-1 text-right">
                        {Math.round((task.loggedHours / task.estimatedHours) * 100)}% complete
                      </div>
                    </div>
                  )}

                  {/* Work Logs */}
                  {task.workLogs?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-text-secondary mb-2">📝 Work Logs</h3>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {task.workLogs.map((log, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border border-border-primary bg-bg-primary text-xs">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[7px] font-bold flex items-center justify-center text-white shrink-0">
                              {log.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-text-primary">{log.hours}h</span>
                            {log.comment && <span className="text-text-tertiary">— {log.comment}</span>}
                            <span className="text-[9px] text-text-tertiary ml-auto shrink-0">
                              {new Date(log.loggedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Work Log Form */}
                  <form onSubmit={handleAddWorkLog} className="space-y-2 p-3 rounded-xl border border-border-primary bg-bg-primary">
                    <h4 className="text-xs font-bold text-text-secondary">Log Time</h4>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.25"
                        step="0.25"
                        value={workLogHours}
                        onChange={(e) => setWorkLogHours(e.target.value)}
                        placeholder="Hours"
                        className="w-20 px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500"
                      />
                      <input
                        type="text"
                        value={workLogComment}
                        onChange={(e) => setWorkLogComment(e.target.value)}
                        placeholder="What did you work on?"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-secondary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-500"
                      />
                      <button
                        type="submit"
                        disabled={!workLogHours || addWorkLog.isPending}
                        className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] text-white font-semibold hover:opacity-90 disabled:opacity-50"
                      >
                        Log
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ─── SubTasks Tab ──────────────────────────────────────────── */}
              {activeTab === 'subtasks' && (
                <div className="space-y-3">
                  {subtasks && subtasks.length > 0 ? (
                    subtasks.map((st) => (
                      <div
                        key={st._id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border-primary bg-bg-primary"
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                            st.status === 'done'
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-border-primary'
                          }`}
                        >
                          {st.status === 'done' && <span className="text-[8px]">✓</span>}
                        </div>
                        <div className="flex-1">
                          <span className="text-xs text-text-primary font-medium">{st.title}</span>
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] text-text-tertiary capitalize">{st.status}</span>
                            <span className="text-[9px] text-text-tertiary capitalize">{st.priority}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-text-tertiary italic text-center py-6">No subtasks created yet.</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="p-2.5 rounded-lg border border-border-primary bg-bg-primary">
      <div className="text-[9px] uppercase font-bold text-text-tertiary tracking-wider mb-0.5">{label}</div>
      <div className="text-xs text-text-primary font-medium capitalize">{value}</div>
    </div>
  );
}
