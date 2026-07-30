import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, membership } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-bg-primary text-text-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
          <p className="text-xs font-semibold text-text-secondary tracking-wider animate-pulse uppercase">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check roles (membership role check for multi-tenant RBAC)
  if (allowedRoles && (!membership || !allowedRoles.includes(membership.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
