import { Router } from 'express';
import * as sprintController from '../controllers/sprintController.js';
import { validateCreateSprint, validateUpdateSprint } from '../validators/sprint.validator.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true }); // inherits :orgId, :workspaceId, :projectId

router.use(protect);
router.use(requireMembership);

// ─── Sprint CRUD ──────────────────────────────────────────────────────────────
router.post('/', validateCreateSprint, sprintController.create);
router.get('/', sprintController.list);
router.get('/active', sprintController.getActiveSprint);
router.get('/velocity', sprintController.getVelocityChart);

router.get('/:sprintId', sprintController.getById);
router.patch('/:sprintId', validateUpdateSprint, sprintController.update);
router.delete('/:sprintId', sprintController.deleteSprint);

// ─── Sprint Lifecycle ─────────────────────────────────────────────────────────
router.post('/:sprintId/start', sprintController.startSprint);
router.post('/:sprintId/complete', sprintController.completeSprint);

// ─── Analytics & Retrospective ────────────────────────────────────────────────
router.get('/:sprintId/burndown', sprintController.getBurndownData);
router.patch('/:sprintId/retrospective', sprintController.updateRetrospective);
router.patch('/:sprintId/capacity', sprintController.updateCapacity);

// ─── Task Movement ────────────────────────────────────────────────────────────
router.post('/:sprintId/tasks', sprintController.moveTasksToSprint);

export default router;
