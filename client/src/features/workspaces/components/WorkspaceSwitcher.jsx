import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useWorkspaces } from '../api/useWorkspaces';

export default function WorkspaceSwitcher() {
  const { membership, setMembership } = useAuth();
  const organizationId = membership?.organizationId;
  const { data: workspaces, isLoading } = useWorkspaces(organizationId);

  const [isOpen, setIsOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (workspaces && workspaces.length > 0) {
      // Use membership workspaceId if set, else default to first workspace
      const savedId = membership?.workspaceId;
      const found = savedId ? workspaces.find((ws) => ws._id === savedId) : null;
      setActiveWorkspace(found || workspaces[0]);
    }
  }, [workspaces, membership?.workspaceId]);

  const handleSwitchWorkspace = (ws) => {
    setActiveWorkspace(ws);
    setIsOpen(false);
    // Persist to localStorage
    localStorage.setItem('nexora_workspace_id', ws._id);
    // Update auth context membership
    if (typeof setMembership === 'function') {
      setMembership((prev) => ({ ...prev, workspaceId: ws._id }));
    }
  };

  if (isLoading || !workspaces || workspaces.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-primary bg-bg-secondary hover:bg-bg-tertiary transition-colors"
      >
        <span className="w-5 h-5 flex items-center justify-center rounded bg-gradient-to-tr from-brand-600 to-[#9f85ff] text-white text-[10px] font-bold">
          {activeWorkspace ? activeWorkspace.name.charAt(0).toUpperCase() : 'W'}
        </span>
        <span className="text-xs font-semibold text-text-primary max-w-[100px] truncate">
          {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
        </span>
        <span className="text-text-secondary text-[10px]">▼</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 rounded-xl border border-border-primary bg-bg-secondary shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border-primary">
            <span className="text-[10px] uppercase font-bold text-text-tertiary px-2">Switch Workspace</span>
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            {workspaces.map((ws) => (
              <button
                key={ws._id}
                onClick={() => handleSwitchWorkspace(ws)}
                className={`w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
                  activeWorkspace?._id === ws._id
                    ? 'bg-brand-500/10 text-brand-500 font-semibold'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
              >
                <span className={`w-4 h-4 flex items-center justify-center rounded ${activeWorkspace?._id === ws._id ? 'bg-brand-500 text-white' : 'bg-bg-tertiary text-text-tertiary'} text-[9px] font-bold`}>
                  {ws.name.charAt(0).toUpperCase()}
                </span>
                <span className="truncate">{ws.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

