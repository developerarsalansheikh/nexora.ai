import React from 'react';

export function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 animate-pulse">
      {Array.from({ length: 4 }).map((_, colIdx) => (
        <div
          key={colIdx}
          className="p-4 rounded-2xl bg-bg-secondary/40 border border-border-primary min-h-[450px] flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-5 w-24 rounded bg-bg-tertiary" />
            <div className="h-4 w-8 rounded-full bg-bg-tertiary" />
          </div>
          <div className="space-y-3 flex-1">
            {Array.from({ length: 3 }).map((_, cardIdx) => (
              <div key={cardIdx} className="p-4 rounded-xl border border-border-primary bg-bg-secondary/80 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-12 rounded bg-bg-tertiary" />
                  <div className="h-4 w-16 rounded bg-bg-tertiary" />
                </div>
                <div className="h-4 w-full rounded bg-bg-tertiary" />
                <div className="h-3 w-3/4 rounded bg-bg-tertiary" />
                <div className="pt-2 border-t border-border-primary flex justify-between">
                  <div className="h-5 w-5 rounded-full bg-bg-tertiary" />
                  <div className="h-3 w-8 rounded bg-bg-tertiary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
