import React from 'react';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from './QueryProvider';
import { UIProvider } from './UIProvider';
import { AuthProvider } from '../context/AuthContext';

/**
 * Orchestrator component nesting data clients, telemetry links, and style layouts.
 */
export function AppProvider({ children }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <UIProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-secondary, #18181b)',
                color: 'var(--text-primary, #fff)',
                border: '1px solid var(--border-primary, #27272a)',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
        </UIProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default AppProvider;

