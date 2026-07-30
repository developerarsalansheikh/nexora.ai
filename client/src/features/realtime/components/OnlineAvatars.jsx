import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function OnlineAvatars({ maxDisplay = 4 }) {
  const { onlineUsers } = useSocket();

  const displayUsers = onlineUsers.slice(0, maxDisplay);
  const remainingCount = Math.max(0, onlineUsers.length - maxDisplay);

  if (onlineUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5" title={`${onlineUsers.length} online in workspace`}>
      <div className="flex -space-x-2 overflow-hidden py-1">
        {displayUsers.map((user, idx) => (
          <div key={user.id || idx} className="relative group">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full object-cover ring-2 ring-bg-primary"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-[9px] font-bold flex items-center justify-center text-white ring-2 ring-bg-primary">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-bg-primary" />

            {/* Hover Tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 hidden group-hover:block z-50 whitespace-nowrap px-2 py-0.5 rounded bg-bg-secondary border border-border-primary text-[10px] text-text-primary shadow-lg font-medium">
              {user.name}
            </div>
          </div>
        ))}
      </div>

      {remainingCount > 0 && (
        <span className="text-[10px] font-mono font-semibold text-text-tertiary">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
