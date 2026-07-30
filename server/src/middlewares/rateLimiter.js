import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/apiError.js';

const handler = (req, res, next, options) => {
  next(ApiError.tooManyRequests(options.message));
};

/**
 * General API rate limiter — applied globally.
 * Configurable via env: RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
 */
export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
  handler,
});

/**
 * Strict rate limiter for auth endpoints (login, register).
 * Limits to 10 attempts per 15 minutes.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please try again after 15 minutes.',
  handler,
});
