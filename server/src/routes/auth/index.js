import { Router } from 'express';
import * as authController from '../../controllers/auth/authController.js';
import { authenticateUser } from '../../middlewares/authenticateUser.js';
import { validateOrganization } from '../../middlewares/validateOrganization.js';
import { validate } from '../../middlewares/validate.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  updateMeSchema,
} from '../../validators/auth.validator.js';

const router = Router();

// ─── Public Endpoints ────────────────────────────────────────────────────────
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post(
  '/login',
  authLimiter,
  validateOrganization,
  validate(loginSchema),
  authController.login,
);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post(
  '/forgot-password',
  authLimiter,
  validateOrganization,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);

// ─── Private (Authenticated) Endpoints ────────────────────────────────────────
router.use(authenticateUser);

router.post('/change-password', validate(changePasswordSchema), authController.changePassword);
router.get('/me', authController.getMe);
router.patch('/profile', validate(updateMeSchema), authController.updateProfile);

// Session Management
router.get('/sessions', authController.getSessions);
router.delete('/sessions/:sessionId', authController.revokeSession);

export default router;
