import React from 'react';
import { AppProvider } from './providers/AppProvider';
import AppRoutes from './routes/AppRoutes';

/**
 * Root Application Core component.
 * Mounts the primary AppProvider aggregator and renders core routes.
 */
export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
