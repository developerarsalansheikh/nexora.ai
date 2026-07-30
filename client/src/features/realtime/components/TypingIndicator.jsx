import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function TypingIndicator() {
  const { typingUsers } = useSocket();

  if (typingUsers.length === 0) return null;

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0].name} is typing...`
      : `${typingUsers.map((u) => u.name).join(', ')} are typing...`;

  return (
    <div className="flex items-center gap-2 py-1 text-xs text-brand-400 italic">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-[11px] font-medium">{text}</span>
    </div>
  );
}
