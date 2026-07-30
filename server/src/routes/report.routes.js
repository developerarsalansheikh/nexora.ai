import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireMembership);

router.get('/:reportType', reportController.getReport);

export default router;
