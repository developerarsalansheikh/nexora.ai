import { Router } from 'express';
import * as workspaceController from '../controllers/workspaceController.js';
import * as labelController from '../controllers/labelController.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true }); // inherits :orgId

router.use(protect);
router.use(requireMembership);

// ─── Workspaces ───────────────────────────────────────────────────────────────
router.post('/', workspaceController.create);
router.get('/', workspaceController.list);
router.get('/:workspaceId', workspaceController.getById);
router.patch('/:workspaceId', workspaceController.update);
router.delete('/:workspaceId', workspaceController.deleteWorkspace);

// ─── Labels (workspace-scoped) ────────────────────────────────────────────────
router.get('/:workspaceId/labels', labelController.list);
router.post('/:workspaceId/labels', labelController.create);
router.patch('/:workspaceId/labels/:labelId', labelController.update);
router.delete('/:workspaceId/labels/:labelId', labelController.deleteLabel);

export default router;
