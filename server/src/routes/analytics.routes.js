import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireMembership);

router.get('/', analyticsController.getAnalytics);

export default router;
