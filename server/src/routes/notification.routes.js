import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true });

router.use(protect);
router.use(requireMembership);

router.get('/', notificationController.getNotifications);
router.patch('/mark-all-read', notificationController.markAllAsRead);
router.patch('/:notificationId/read', notificationController.markAsRead);
router.patch('/:notificationId/archive', notificationController.archiveNotification);
router.delete('/:notificationId', notificationController.deleteNotification);

router.get('/preferences', notificationController.getPreferences);
router.put('/preferences', notificationController.updatePreferences);

export default router;
