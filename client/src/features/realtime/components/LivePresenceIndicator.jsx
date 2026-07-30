import React from 'react';

export default function LivePresenceIndicator({ isOnline = true, label = '' }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline ? 'bg-emerald-500' : 'bg-gray-400'
          }`}
        />
      </span>
      {label && <span className="text-[10px] font-medium text-text-tertiary">{label}</span>}
    </div>
  );
}
