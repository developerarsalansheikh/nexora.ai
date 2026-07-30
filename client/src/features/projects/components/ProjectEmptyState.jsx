import React from 'react';

export default function ProjectEmptyState({ title, description, actionText, onAction, isFilterEmpty }) {
  return (
    <div className="text-center p-12 border border-dashed border-border-primary rounded-2xl bg-bg-secondary/20 max-w-xl mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center mx-auto text-2xl mb-4 font-black">
        📁
      </div>
      <h3 className="text-base font-bold text-text-primary mb-1">
        {title || (isFilterEmpty ? 'No matching projects found' : 'No projects created yet')}
      </h3>
      <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed mb-6">
        {description || (isFilterEmpty ? 'Try adjusting your search criteria or clearing active filters.' : 'Get started by creating your first initiative or project within this workspace.')}
      </p>
      {onAction && actionText && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs rounded-xl bg-gradient-to-r from-brand-600 to-[#9f85ff] hover:opacity-90 font-medium text-white shadow-md shadow-brand-500/10 transition-opacity"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
