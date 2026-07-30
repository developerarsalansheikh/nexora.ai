import React from 'react';

export default function ProjectFilterToolbar({
  search,
  setSearch,
  status,
  setStatus,
  visibility,
  setVisibility,
  category,
  setCategory,
  sort,
  setSort,
  viewMode,
  setViewMode,
  onlyFavorites,
  setOnlyFavorites,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-border-primary bg-bg-secondary/40 backdrop-blur-md">
      {/* Left: Search & Filter inputs */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xs">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, key, or category..."
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

        {/* Status Select */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>

        {/* Visibility Select */}
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Visibilities</option>
          <option value="internal">Internal</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        {/* Category Select */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">All Categories</option>
          <option value="Engineering">Engineering</option>
          <option value="Product">Product</option>
          <option value="Marketing">Marketing</option>
          <option value="Design">Design</option>
          <option value="Operations">Operations</option>
        </select>

        {/* Favorites Toggle */}
        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          className={`px-3 py-2 text-xs rounded-xl border transition-colors flex items-center gap-1.5 font-semibold ${
            onlyFavorites
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
              : 'border-border-primary bg-bg-primary text-text-secondary hover:text-text-primary'
          }`}
        >
          ★ Favorites {onlyFavorites ? 'On' : 'Only'}
        </button>
      </div>

      {/* Right: Sort & View Mode switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-border-primary bg-bg-primary text-text-primary focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="key">Key (A-Z)</option>
        </select>

        {/* View mode toggle */}
        <div className="flex items-center rounded-xl border border-border-primary bg-bg-primary p-1">
          <button
            onClick={() => setViewMode('grid')}
            title="Grid view"
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-brand-500 text-white font-bold' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            田
          </button>
          <button
            onClick={() => setViewMode('list')}
            title="List view"
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-brand-500 text-white font-bold' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  );
}
