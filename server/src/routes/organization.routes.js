import { Router } from 'express';
import * as orgController from '../controllers/organizationController.js';
import * as memberController from '../controllers/memberController.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router();

// All org routes require auth
router.use(protect);

// ─── Organization CRUD ────────────────────────────────────────────────────────
router.post('/', orgController.create);
router.get('/', orgController.getMyOrganizations);
router.get('/invitations', orgController.getMyInvitations);

// Routes that need org membership context
router.get('/:orgId', requireMembership, orgController.getById);
router.patch('/:orgId', requireMembership, orgController.update);
router.delete('/:orgId', requireMembership, orgController.deleteOrg);

// ─── Member management (nested under org) ────────────────────────────────────
router.get('/:orgId/members', requireMembership, memberController.listMembers);
router.post('/:orgId/members/invite', requireMembership, memberController.invite);

// Invitation response routes (user does not need to be active member yet)
router.post('/:orgId/members/accept', memberController.acceptInvitation);
router.post('/:orgId/members/reject', memberController.rejectInvitation);

router.patch('/:orgId/members/:memberId', requireMembership, memberController.updateRole);
router.delete('/:orgId/members/:memberId', requireMembership, memberController.removeMember);

export default router;
