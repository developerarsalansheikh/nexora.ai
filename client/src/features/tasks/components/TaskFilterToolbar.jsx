import React from 'react';

export default function TaskFilterToolbar({
  search,
  setSearch,
  type,
  setType,
  priority,
  setPriority,
  swimlane,
  setSwimlane,
  onResetFilters,
  currentUserId,
  onFilterMyTasks,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md">
      {/* Search & Inputs */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xs">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title, key, or description..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Type Select */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Types</option>
          <option value="story">📖 Story</option>
          <option value="task">✅ Task</option>
          <option value="bug">🐛 Bug</option>
          <option value="epic">⚡ Epic</option>
          <option value="improvement">🚀 Improvement</option>
        </select>

        {/* Priority Select */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Priorities</option>
          <option value="urgent">🚨 Urgent</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🔵 Low</option>
          <option value="no_priority">⚪ No Priority</option>
        </select>

        {/* Quick Filter: My Tasks */}
        <button
          onClick={onFilterMyTasks}
          className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-secondary hover:text-text-primary transition-colors font-medium"
        >
          👤 My Tasks
        </button>
      </div>

      {/* Swimlane & View Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-text-tertiary">Swimlane:</span>
          <select
            value={swimlane}
            onChange={(e) => setSwimlane(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="status">Status Lanes</option>
            <option value="priority">Priority Lanes</option>
            <option value="type">Type Lanes</option>
          </select>
        </div>

        {(search || type || priority) && (
          <button
            onClick={onResetFilters}
            className="text-xs text-brand-500 hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
