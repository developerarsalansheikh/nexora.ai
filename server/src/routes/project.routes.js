import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { validateCreateProject, validateUpdateProject } from '../validators/project.validator.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true }); // inherits :orgId, :workspaceId

router.use(protect);
router.use(requireMembership);

// ─── Project Lifecycle Routes ──────────────────────────────────────────────────
router.post('/', validateCreateProject, projectController.create);
router.get('/', projectController.list);
router.get('/:projectId', projectController.getById);
router.patch('/:projectId', validateUpdateProject, projectController.update);
router.delete('/:projectId', projectController.deleteProject);

// ─── Archive & Restore ─────────────────────────────────────────────────────────
router.post('/:projectId/archive', projectController.archive);
router.post('/:projectId/restore', projectController.restore);

// ─── Favorite Toggle ──────────────────────────────────────────────────────────
router.post('/:projectId/favorite', projectController.toggleFavorite);

// ─── Duplication ──────────────────────────────────────────────────────────────
router.post('/:projectId/duplicate', projectController.duplicate);

// ─── Project Members Management ────────────────────────────────────────────────
router.post('/:projectId/members', projectController.addMember);
router.delete('/:projectId/members/:userId', projectController.removeMember);
router.patch('/:projectId/members/:userId', projectController.updateMemberRole);

// ─── Activity Log Stream ───────────────────────────────────────────────────────
router.get('/:projectId/activity', projectController.getActivityLog);

export default router;
