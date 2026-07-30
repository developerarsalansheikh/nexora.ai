import React from 'react';
import { useSocket } from '../context/SocketContext';

export default function ConnectionStatus() {
  const { isConnected } = useSocket();

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono border ${
        isConnected
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
      <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
    </div>
  );
}
