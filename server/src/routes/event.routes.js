import { Router } from 'express';
import * as eventController from '../controllers/eventController.js';
import { validateCreateEvent, validateUpdateEvent } from '../validators/event.validator.js';
import { protect } from '../middlewares/auth.js';
import { requireMembership } from '../middlewares/tenancy.js';

const router = Router({ mergeParams: true }); // inherits :orgId, :workspaceId

router.use(protect);
router.use(requireMembership);

router.post('/', validateCreateEvent, eventController.create);
router.get('/', eventController.getUnifiedEvents);
router.get('/:eventId', eventController.getById);
router.patch('/:eventId', validateUpdateEvent, eventController.update);
router.delete('/:eventId', eventController.deleteEvent);

export default router;
