/**
 * DebugPanel – Temporary debug component to trace API responses live.
 * Mount this anywhere in AppLayout or Dashboard to see live data.
 * REMOVE BEFORE PRODUCTION.
 */
import React, { useState } from 'react';
import apiClient from '../config/axios';

export default function DebugPanel() {
  const [log, setLog] = useState([]);
  const [open, setOpen] = useState(false);

  const addLog = (label, data) => {
    setLog((prev) => [
      { label, data: JSON.stringify(data, null, 2), ts: new Date().toISOString() },
      ...prev,
    ]);
  };

  const runDiag = async () => {
    setLog([]);
    const orgId = localStorage.getItem('nexora_org_id');
    const wsId = localStorage.getItem('nexora_workspace_id');
    const token = localStorage.getItem('nexora_jwt_token');

    addLog('localStorage', { orgId, wsId, hasToken: !!token });

    if (!orgId) {
      addLog('❌ ERROR', 'No nexora_org_id in localStorage. User may not be logged in or auth context broken.');
      return;
    }

    try {
      const me = await apiClient.get('/auth/me');
      addLog('GET /auth/me → full response', me);
    } catch (e) {
      addLog('❌ GET /auth/me ERROR', { message: e.message, status: e.status, response: e.original?.response?.data });
    }

    try {
      const ws = await apiClient.get(`/organizations/${orgId}/workspaces`);
      addLog(`GET /organizations/${orgId}/workspaces → full response`, ws);
      // Try to extract list
      const envelope = ws?.data ?? ws;
      addLog('envelope keys', Object.keys(envelope || {}));
      if (Array.isArray(envelope?.data)) addLog('✅ workspaces via envelope.data', envelope.data);
      else if (Array.isArray(envelope)) addLog('✅ workspaces array directly', envelope);
      else addLog('❌ cannot extract workspaces', envelope);
    } catch (e) {
      addLog('❌ GET /workspaces ERROR', { message: e.message, status: e.status });
    }

    if (wsId) {
      try {
        const proj = await apiClient.get(`/organizations/${orgId}/workspaces/${wsId}/projects`);
        addLog(`GET /projects → full response`, proj);
        const pEnv = proj?.data ?? proj;
        addLog('projects envelope keys', Object.keys(pEnv || {}));
        addLog('projects docs sample', (pEnv?.docs || []).slice(0, 2));
      } catch (e) {
        addLog('❌ GET /projects ERROR', { message: e.message, status: e.status });
      }
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-[9999] px-3 py-2 text-xs rounded-xl bg-rose-500 text-white shadow-lg font-mono"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-[480px] max-h-[70vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl text-xs font-mono text-gray-200 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-yellow-400 font-bold">🐛 Nexora Debug Panel</span>
        <div className="flex gap-2">
          <button onClick={runDiag} className="px-2 py-1 bg-green-600 rounded text-white">Run Diag</button>
          <button onClick={() => setLog([])} className="px-2 py-1 bg-gray-700 rounded">Clear</button>
          <button onClick={() => setOpen(false)} className="px-2 py-1 bg-gray-700 rounded">✕</button>
        </div>
      </div>
      {log.length === 0 && <p className="text-gray-500 text-center py-4">Click "Run Diag" to start</p>}
      {log.map((entry, i) => (
        <div key={i} className="mb-3 border-b border-gray-700 pb-2">
          <div className="text-cyan-400 font-bold mb-1">{entry.label}</div>
          <pre className="text-gray-300 text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
            {entry.data}
          </pre>
        </div>
      ))}
    </div>
  );
}
