import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../config/queryClient';

/**
 * Providers wrapper injecting TanStack Query state caching policies into the tree.
 */
export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
