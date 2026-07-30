import React from 'react';

export function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="w-16 h-5 rounded bg-bg-tertiary" />
        <div className="w-20 h-5 rounded-full bg-bg-tertiary" />
      </div>
      <div className="h-6 w-3/4 rounded bg-bg-tertiary" />
      <div className="h-4 w-full rounded bg-bg-tertiary" />
      <div className="h-4 w-2/3 rounded bg-bg-tertiary" />
      <div className="pt-4 border-t border-border-primary flex justify-between items-center">
        <div className="w-24 h-4 rounded bg-bg-tertiary" />
        <div className="w-8 h-8 rounded-full bg-bg-tertiary" />
      </div>
    </div>
  );
}

export function ProjectGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProjectTableSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-2xl border border-border-primary bg-bg-secondary/40 overflow-hidden animate-pulse">
      <div className="p-4 border-b border-border-primary bg-bg-tertiary/50 h-10 w-full" />
      <div className="divide-y divide-border-primary">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-1/3">
              <div className="w-8 h-8 rounded bg-bg-tertiary shrink-0" />
              <div className="space-y-1 w-full">
                <div className="h-4 w-3/4 rounded bg-bg-tertiary" />
                <div className="h-3 w-1/2 rounded bg-bg-tertiary" />
              </div>
            </div>
            <div className="h-4 w-20 rounded bg-bg-tertiary" />
            <div className="h-4 w-20 rounded bg-bg-tertiary" />
            <div className="h-4 w-16 rounded bg-bg-tertiary" />
          </div>
        ))}
      </div>
    </div>
  );
}
