import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { protect } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';
import {
  registerSchema,
  loginSchema,
  updateMeSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

// ─── Public routes ────────────────────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);

// ─── Private routes ───────────────────────────────────────────────────────────
router.use(protect);

router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/me', validate(updateMeSchema), authController.updateMe);
router.patch('/me/password', validate(changePasswordSchema), authController.changePassword);

export default router;
