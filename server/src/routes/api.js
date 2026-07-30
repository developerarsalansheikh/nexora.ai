import { Router } from 'express';
import { globalLimiter } from '../middlewares/rateLimiter.js';

import authRoutes from './auth/index.js';
import organizationRoutes from './organization.routes.js';
import workspaceRoutes from './workspace.routes.js';
import projectRoutes from './project.routes.js';
import sprintRoutes from './sprint.routes.js';
import taskRoutes from './task.routes.js';
import eventRoutes from './event.routes.js';
import aiRoutes from './ai.routes.js';
import notificationRoutes from './notification.routes.js';
import reportRoutes from './report.routes.js';
import analyticsRoutes from './analytics.routes.js';
import billingRoutes from './billing.routes.js';

const router = Router();

// ─── Global rate limiter ──────────────────────────────────────────────────────
router.use(globalLimiter);

// ─── Health check probes ──────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Nexora Core API',
    version: 'v1',
  });
});

router.get('/health/readiness', async (req, res) => {
  try {
    const isDbConnected = (await import('mongoose')).default.connection.readyState === 1;
    if (isDbConnected) {
      return res.status(200).json({ status: 'ready', database: 'connected', timestamp: new Date().toISOString() });
    }
    return res.status(503).json({ status: 'not_ready', database: 'disconnected', timestamp: new Date().toISOString() });
  } catch {
    return res.status(503).json({ status: 'not_ready', error: 'Database check failed' });
  }
});

router.get('/health/metrics', (req, res) => {
  const mem = process.memoryUsage();
  res.status(200).json({
    uptimeSeconds: Math.floor(process.uptime()),
    memory: {
      rssMb: Math.round(mem.rss / (1024 * 1024)),
      heapTotalMb: Math.round(mem.heapTotal / (1024 * 1024)),
      heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024)),
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── Feature Routes ───────────────────────────────────────────────────────────

// Auth
router.use('/auth', authRoutes);

// Organizations (includes nested /members)
router.use('/organizations', organizationRoutes);

// Workspaces — nested under org: /organizations/:orgId/workspaces
router.use('/organizations/:orgId/workspaces', workspaceRoutes);

// Calendar Events — nested under workspace: /organizations/:orgId/workspaces/:workspaceId/events
router.use('/organizations/:orgId/workspaces/:workspaceId/events', eventRoutes);

// AI Assistant — nested under workspace: /organizations/:orgId/workspaces/:workspaceId/ai
router.use('/organizations/:orgId/workspaces/:workspaceId/ai', aiRoutes);

// Notifications — nested under workspace: /organizations/:orgId/workspaces/:workspaceId/notifications
router.use('/organizations/:orgId/workspaces/:workspaceId/notifications', notificationRoutes);

// Reports — nested under workspace: /organizations/:orgId/workspaces/:workspaceId/reports
router.use('/organizations/:orgId/workspaces/:workspaceId/reports', reportRoutes);

// Analytics — nested under workspace: /organizations/:orgId/workspaces/:workspaceId/analytics
router.use('/organizations/:orgId/workspaces/:workspaceId/analytics', analyticsRoutes);

// Billing — nested under organization: /organizations/:orgId/billing
router.use('/organizations/:orgId/billing', billingRoutes);

// Projects — nested under workspace: /organizations/:orgId/workspaces/:workspaceId/projects
router.use('/organizations/:orgId/workspaces/:workspaceId/projects', projectRoutes);

// Sprints — nested under project: /organizations/:orgId/workspaces/:workspaceId/projects/:projectId/sprints
router.use(
  '/organizations/:orgId/workspaces/:workspaceId/projects/:projectId/sprints',
  sprintRoutes,
);

// Tasks — nested under project: /organizations/:orgId/workspaces/:workspaceId/projects/:projectId/tasks
router.use('/organizations/:orgId/workspaces/:workspaceId/projects/:projectId/tasks', taskRoutes);

export default router;
