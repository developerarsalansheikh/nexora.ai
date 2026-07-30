import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Real-time Provider
import { SocketProvider } from '../features/realtime/context/SocketContext';

// Layout wrappers
import AppLayout from '../layouts/AppLayout';

// Guard wrappers
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Authentication Pages (eager loaded for instant login UX)
import Login from '../features/auth/pages/Login';
import Register from '../features/auth/pages/Register';
import ForgotPassword from '../features/auth/pages/ForgotPassword';
import ResetPassword from '../features/auth/pages/ResetPassword';
import VerifyEmail from '../features/auth/pages/VerifyEmail';
import Unauthorized from '../features/auth/pages/Unauthorized';
import NotFound from '../features/auth/pages/NotFound';

// Lazy Loaded Feature Pages
const DashboardOverview = lazy(() => import('../features/dashboard/components/DashboardOverview'));
const ProjectsDashboard = lazy(() => import('../features/projects/pages/ProjectsDashboard'));
const ProjectDetailsPage = lazy(() => import('../features/projects/pages/ProjectDetailsPage'));
const ArchivedProjectsPage = lazy(() => import('../features/projects/pages/ArchivedProjectsPage'));
const TaskBoardPage = lazy(() => import('../features/tasks/pages/TaskBoardPage'));
import TaskBoardRedirect from '../features/tasks/pages/TaskBoardRedirect';
import SprintRedirect from '../features/sprints/pages/SprintRedirect';
const SprintDashboardPage = lazy(() => import('../features/sprints/pages/SprintDashboardPage'));
const SprintReportPage = lazy(() => import('../features/sprints/pages/SprintReportPage'));
const CalendarPage = lazy(() => import('../features/calendar/pages/CalendarPage'));
const SettingsOverview = lazy(() => import('../features/settings/components/SettingsOverview'));
const WorkspaceList = lazy(() => import('../features/workspaces/pages/WorkspaceList'));
const MembersPage = lazy(() => import('../features/members/pages/MembersPage'));
const AiAuditDashboard = lazy(() => import('../features/ai/components/AiAuditDashboard'));
const NotificationCenterPage = lazy(() => import('../features/notifications/pages/NotificationCenterPage'));
const NotificationSettingsPage = lazy(() => import('../features/notifications/pages/NotificationSettingsPage'));
const ReportsDashboardPage = lazy(() => import('../features/reports/pages/ReportsDashboardPage'));
const AnalyticsDashboardPage = lazy(() => import('../features/analytics/pages/AnalyticsDashboardPage'));
const BillingDashboardPage = lazy(() => import('../features/billing/pages/BillingDashboardPage'));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh] text-xs font-semibold text-text-tertiary">
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
      <span>Loading Nexora Workspace...</span>
    </div>
  </div>
);

/**
 * Global Routing definitions with React Router v7 and Code-Splitting.
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Route>

          {/* Access Denied Page */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Private Workspace Frame */}
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <Suspense fallback={<PageFallback />}>
                  <AppLayout />
                </Suspense>
              }
            >
              <Route path="/" element={<DashboardOverview />} />
              <Route path="/projects" element={<ProjectsDashboard />} />
              <Route path="/projects/archived" element={<ArchivedProjectsPage />} />
              <Route path="/projects/:projectId" element={<ProjectDetailsPage />} />
              <Route path="/board" element={<TaskBoardRedirect />} />
              <Route path="/sprints" element={<SprintRedirect />} />
              <Route path="/projects/:projectId/board" element={<TaskBoardPage />} />
              <Route path="/projects/:projectId/sprints" element={<SprintDashboardPage />} />
              <Route path="/projects/:projectId/sprints/reports" element={<SprintReportPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/ai-audit" element={<AiAuditDashboard />} />
              <Route path="/notifications" element={<NotificationCenterPage />} />
              <Route path="/settings/notifications" element={<NotificationSettingsPage />} />
              <Route path="/reports" element={<ReportsDashboardPage />} />
              <Route path="/analytics" element={<AnalyticsDashboardPage />} />
              <Route path="/billing" element={<BillingDashboardPage />} />
              <Route path="/workspaces" element={<WorkspaceList />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/settings" element={<SettingsOverview />} />
            </Route>
          </Route>

          {/* Catch-all 404 handler */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}
