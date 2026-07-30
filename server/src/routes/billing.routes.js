import { Router } from 'express';
import * as billingController from '../controllers/billingController.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireMembership);

router.get('/subscription', billingController.getSubscription);
router.post('/upgrade', billingController.upgradePlan);
router.get('/invoices', billingController.getInvoices);
router.get('/feature-check', billingController.checkFeature);

export default router;
