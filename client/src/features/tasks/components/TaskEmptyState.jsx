import React from 'react';

export default function TaskEmptyState({ title, description, actionText, onAction }) {
  return (
    <div className="text-center p-10 border border-dashed border-border-primary rounded-2xl bg-bg-secondary/20 max-w-md mx-auto my-8">
      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center mx-auto text-xl mb-3 font-bold">
        🎯
      </div>
      <h3 className="text-sm font-bold text-text-primary mb-1">
        {title || 'No tasks found'}
      </h3>
      <p className="text-xs text-text-secondary leading-relaxed mb-4">
        {description || 'There are no active tasks matching your filter criteria.'}
      </p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-sm transition-opacity"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
